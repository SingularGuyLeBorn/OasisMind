_vars = [var for var in all_vars if 'disc' in var.name]
        update_ops = tf.get_collection(tf.GraphKeys.UPDATE_OPS)
        with tf.control_dependencies(update_ops):
            self.g_optim = tf.train.AdamOptimizer(self.params['adv_train_lr'], beta1=0.5, beta2=0.99) \
                .minimize(self.g_loss, var_list=gene_vars)
            self.d_optim = tf.train.AdamOptimizer(self.params['adv_train_lr'], beta1=0.5, beta2=0.99) \
                .minimize(self.d_loss, var_list=disc_vars)

        self.saver = tf.train.Saver(max_to_keep=1000)
        with self._session.as_default() as sess:
            sess.run(tf.global_variables_initializer())
            if self.params['resume_epoch'] != 0:
                logger.info(f'loading model from {self.model_path}')
                self.saver.restore(
                    sess,
                    osp.join(self.model_path,
                             'model-' + str(self.params['resume_epoch'])))

    def _override_params_from_file(self):

        self.params['photo'] = self.cfg['train']['photo']
        self.params['cartoon'] = self.cfg['train']['cartoon']
        self.params['patch_size'] = self.cfg['train']['patch_size']
        self.params['work_dir'] = self.cfg['train']['work_dir']
        self.params['batch_size'] = self.cfg['train']['batch_size']
        self.params['adv_train_lr'] = self.cfg['train']['adv_train_lr']
        self.params['max_steps'] = self.cfg['train']['max_steps']
        self.params['logging_interval'] = self.cfg['train']['logging_interval']
        self.params['ckpt_period_interval'] = self.cfg['train'][
            'ckpt_period_interval']
        self.params['resume_epoch'] = self.cfg['train']['resume_epoch']
        self.params['num_gpus'] = self.cfg['train']['num_gpus']

    def train(self, *args, **kwargs):
        logger.info('Begin local cartoon translator training')

        photo_ds = tf_data_loader(self.face_photo_list,
                                  self.params['batch_size'])
        cartoon_ds = tf_data_loader(self.face_cartoon_list,
                                    self.params['batch_size'])
        photo_iterator = photo_ds.make_initializable_iterator()
        cartoon_iterator = cartoon_ds.make_initializable_iterator()
        photo_next = photo_iterator.get_next()
        cartoon_next = cartoon_iterator.get_next()

        device = 'gpu:0' if tf.test.is_gpu_available else 'cpu:0'
        with tf.device(device):

            for max_steps in tqdm(range(self.params['max_steps'])):

                self._session.run(photo_iterator.initializer)
                self._session.run(cartoon_iterator.initializer)

                photo_batch, cartoon_batch = self._session.run(
                    [photo_next, cartoon_next])

                transfer_res = self._session.run(
                    self.output_cartoon,
                    feed_dict={self.input_photo: photo_batch})

                input_superpixel = simple_superpixel(transfer_res, seg_num=200)
                g_loss, _ = self._session.run(
                    [self.g_loss, self.g_optim],
                    feed_dict={
                        self.input_photo: photo_batch,
                        self.input_superpixel: input_superpixel,
                        self.input_cartoon: cartoon_batch
                    })

                d_loss, _, train_info = self._session.run(
                    [self.d_loss, self.d_optim, self.summary_op],
                    feed_dict={
                        self.input_photo: photo_batch,
                        self.input_superpixel: input_superpixel,
                        self.input_cartoon: cartoon_batch
                    })

                self.train_writer.add_summary(train_info, max_steps)

                if np.mod(max_steps + 1, self.params['logging_interval']
                          ) == 0 or max_steps == 0:

                    logger.info(
                        f'Iter: {max_steps}, d_loss: {d_loss}, g_loss: {g_loss}'
                    )

                    if np.mod(max_steps + 1,
                              self.params['ckpt_period_interval']
                              ) == 0 or max_steps == 0:
                        self.saver.save(
                            self._session,
                            self.params['work_dir'] + '/saved_models/model',
                            write_meta_graph=False,
                            global_step=max_steps)

                        result_face = self._session.run(
                            self.output_cartoon,
                            feed_dict={
                                self.input_photo: photo_batch,
                                self.input_superpixel: photo_batch,
                                self.input_cartoon: cartoon_batch
                            })

                        write_batch_image(
                            result_face, self.params['work_dir'] + '/images',
                            str('%8d' % max_steps) + '_face_result.jpg', 4)
                        write_batch_image(
                            photo_batch, self.params['work_dir'] + '/images',
                            str('%8d' % max_steps) + '_face_photo.jpg', 4)

    def evaluate(self,
                 checkpoint_path: Optional[str] = None,
                 *args,
                 **kwargs) -> Dict[str, float]:
        """evaluate a dataset

        evaluate a dataset via a specific model from the `checkpoint_path` path, if the `checkpoint_path`
        does not exist, read from the config file.

        Args:
            checkpoint_path (Optional[str], optional): the model path. Defaults to None.

        Returns:
            Dict[str, float]: the results about the evaluation
            Example:
            {"accuracy": 0.509174311926605