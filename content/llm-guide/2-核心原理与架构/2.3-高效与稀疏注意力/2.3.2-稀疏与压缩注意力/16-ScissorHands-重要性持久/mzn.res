ection: column;
}

.editor__image-container {
  justify-items: center;
  padding: 15px;
  position: relative;
  height: 100%;
  border-radius: var(--menu-border-radius, 6px);

  background-color: ${surface200};
  background-image: repeating-linear-gradient(
      -145deg,
      transparent,
      transparent 8px,
      ${surface200} 8px,
      ${surface200} 11px
    ),
    repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 15px,
      ${gray100} 15px,
      ${gray100} 16px
    );
}

.editor__canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor__canvas-container > * {
  object-fit: contain;
  position: absolute;
}

.editor__tool-container {
  padding-top: 8px;
  display: flex;
  justify-content: center;
}

.editor__tool-bar {
  display: flex;
  gap: 8px;
}

.editor__tool {
  display: flex;
  padding: 8px 12px;
  justify-content: center;
  align-items: center;
  border: var(--button-border, var(--border));
  border-radius: var(--button-border-radius, 6px);
  background: var(--button-background, var(--background));
  color: var(--button-color, var(--foreground));
}

.editor__tool--active {
  background: var(--button-primary-background, var(--accent-background));
  color: var(--button-primary-color, var(--accent-foreground));
}

.editor__rect {
  position: absolute;
  z-index: 2;
}

.editor__rect button {
  opacity: 0;
  position: absolute;
  top: -12px;
  right: -12px;
  cursor: pointer;
  padding: 0;
  z-index: 3;
  border: none;
  background: none;
}

.editor__rect:hover button {
  opacity: 1;
}
`;

  if (styleNonce) {
    style.setAttribute('nonce', styleNonce);
  }

  return style;
}

function ToolbarFactory({
  h, // eslint-disable-line @typescript-eslint/no-unused-vars
}) {
  return function Toolbar({
    action,
    setAction,
    options,
  }

) {
    return (
      h('div', { class: "editor__tool-container",}
        , h('div', { class: "editor__tool-bar",}
          , h('button', {
            type: "button",
            class: `editor__tool ${action === 'highlight' ? 'editor__tool--active' : ''}`,
            onClick: () => {
              setAction(action === 'highlight' ? '' : 'highlight');
            },}

            , options.highlightToolText
          )
          , h('button', {
            type: "button",
            class: `editor__tool ${action === 'hide' ? 'editor__tool--active' : ''}`,
            onClick: () => {
              setAction(action === 'hide' ? '' : 'hide');
            },}

            , options.hideToolText
          )
        )
      )
    );
  };
}

function useTakeScreenshotFactory({ hooks }) {
  function useDpi() {
    const [dpi, setDpi] = hooks.useState(WINDOW.devicePixelRatio ?? 1);
    hooks.useEffect(() => {
      const onChange = () => {
        setDpi(WINDOW.devicePixelRatio);
      };
      const media = matchMedia(`(resolution: ${WINDOW.devicePixelRatio}dppx)`);
      media.addEventListener('change', onChange);
      return () => {
        media.removeEventListener('change', onChange);
      };
    }, []);

    return dpi;
  }

  return function useTakeScreenshot({ onBeforeScreenshot, onScreenshot, onAfterScreenshot, onError }) {
    const dpi = useDpi();

    hooks.useEffect(() => {
      const takeScreenshot = async () => {
        onBeforeScreenshot();

        // Chrome will animate a top-bar which can shrink the window height by a
        // few pixels. The exact amount depends on how fast it takes to exec
        // the onloadedmetadata callback.
        // https://stackoverflow.com/q/75833049
        const stream = await NAVIGATOR.mediaDevices.getDisplayMedia({
          video: {
            width: WINDOW.innerWidth * dpi,
            height: WINDOW.innerHeight * dpi,
          },
          audio: false,
          // @ts-expect-error experimental flags: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#prefercurrenttab
          monitorTypeSurfaces: 'exclude',
          preferCurrentTab: true,
          selfBrowserSurface: 'include',
          surfaceSwitching: 'exclude',
        });

        const video = DOCUMENT.createElement('video');
        await new Promise((resolve, reject) => {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            onScreenshot(video, dpi);
            stream.getTracks().forEach(track => track.stop());
            resolve();
          };
          video.play().catch(reject);
        });
        onAfterScreenshot();
      };

      takeScreenshot().catch(onError);
    }, []);
  };
}

function drawRect(command, ctx, color) {
  switch (command.type) {
    case 'highlight': {
      // creates a shadow around
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 50;

      // draws a rectangle first with a shadow
      ctx.fillStyle = color;
      ctx.fillRect(command.x - 1, command.y - 1, command.w + 2, command.h + 2);

      // cut out the inside of the rectangle
      ctx.clearRect(command.x, command.y, command.w, command.h);

      break;
    }
    case 'hide':
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(command.x, command.y, command.w, command.h);

      break;
  }
}

function with2dContext(
  canvas,
  options,
  callback,
) {
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext('2d', options);
  if (!ctx) {
    return;
  }
  callback(canvas, ctx);
}

function paintImage(maybeDest, source) {
  with2dContext(maybeDest, { alpha: true }, (destCanvas, destCtx) => {
    destCtx.drawImage(source, 0, 0, source.width, source.height, 0, 0, destCanvas.width, destCanvas.height);
  });
}

// Paint the array of drawCommands into a canvas.
// Assuming this is th