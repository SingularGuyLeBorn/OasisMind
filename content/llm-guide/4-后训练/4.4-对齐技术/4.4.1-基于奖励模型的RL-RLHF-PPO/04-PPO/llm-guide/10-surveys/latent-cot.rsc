(
            pipeline.scheduler.config, **scheduler_args)
        pipeline.save_pretrained(output_dir)


@TRAINERS.register_module(module_name=Trainers.cones2_inference)
class ConesDiffusionTrainer(EpochBasedTrainer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        """Dreambooth trainers for fine-tuning stable diffusion

        Args:
            with_prior_preservation: a boolean indicating whether to enable prior loss.
            instance_prompt: a string specifying the instance prompt.
            class_prompt: a string specifying the class prompt.
            class_data_dir: the path to the class data directory.
            num_class_images: the number of class images to generate.
            prior_loss_weight: the weight of the prior loss.

        """
        self.with_prior_preservation = kwargs.pop('with_prior_preservation',
                                                  False)
        self.instance_prompt = kwargs.pop('instance_prompt', 'dog')
        self.class_prompt = kwargs.pop('class_prompt', 'a photo of dog')
        self.class_data_dir = kwargs.pop('class_data_dir', '/tmp/class_data')
        self.num_class_images = kwargs.pop('num_class_images', 200)
        self.resolution = kwargs.pop('resolution', 512)
        self.prior_loss_weight = kwargs.pop('prior_loss_weight', 1.0)

        # Save checkpoint and configure files.
        ckpt_hook = list(
            filter(lambda hook: isinstance(hook, CheckpointHook),
                   self.hooks))[0]
        ckpt_hook.set_processor(ConesCheckpointProcessor(self.model_dir))

        pipeline = DiffusionPipeline.from_pretrained(
            self.model_dir,
            torch_dtype=torch.float32,
            safety_checker=None,
            revision=None,
        )

        pipeline.to(self.device)
        self.target_embed = pipeline.text_encoder(
            pipeline.tokenizer(
                self.instance_prompt,
                truncation=True,
                padding='max_length',
                max_length=pipeline.tokenizer.model_max_length,
                return_tensors='pt',
            ).input_ids.to(self.device))[0].detach()

    def build_optimizer(self, cfg: ConfigDict, default_args: dict = None):
        try:
            return build_optimizer(
                self.model.text_encoder.parameters(),
                cfg=cfg,
                default_args=default_args)

        except KeyError as e:
            self.logger.error(
                f'Build optimizer error, the optimizer {cfg} is a torch native component, '
                f'please check if your torch with version: {torch.__version__} matches the config.'
            )
            raise e

    def train_step(self, model, inputs):
        """ Perform a training step on a batch of inputs.

        Subclass and override to inject custom behavior.

        Args:
            model (`TorchModel`): The model to train.
            inputs (`Dict[str, Union[torch.Tensor, Any]]`):
                The inputs and targets of the model.

                The dictionary will be unpacked before being fed to the model. Most models expect the targets under the
                argument `labels`. Check your model's documentation for all accepted arguments.

        Return:
            `torch.Tensor`: The tensor with training loss on this batch.
        """
        model.train()
        token_num = 1
        self.model.text_encoder.train()
        self._mode = ModeKeys.TRAIN
        # call model forward but not __call__ to skip postprocess

        latents = self.model.vae.encode(inputs['target'].to(
            self.device).to(dtype=torch.float32)).latent_dist.sample()
        latents = latents * self.model.vae.config.scaling_factor
        text_inputs = self.model.tokenizer(
            inputs['text'],
            max_length=self.model.tokenizer.model_max_length,
            truncation=True,
            padding='max_length',
            return_tensors='pt')
        input_ids = torch.squeeze(text_inputs.input_ids).to(self.device)
        # Sample noise that we'll add to the latents
        noise = torch.randn_like(latents)
        bsz = latents.shape[0]
        # Sample a random timestep for each image
        timesteps = torch.randint(
            0,
            self.model.noise_scheduler.num_train_timesteps, (bsz, ),
            device=latents.device)
        timesteps = timesteps.long()

        # Add noise to the latents according to the noise magnitude at each timestep
        # (this is the forward diffusion process)
        noisy_latents = self.model.noise_scheduler.add_noise(
            latents, noise, timesteps)

        # Get the text embedding for co