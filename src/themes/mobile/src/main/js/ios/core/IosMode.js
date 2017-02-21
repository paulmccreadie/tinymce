define(
  'tinymce.themes.mobile.ios.core.IosMode',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Singleton',
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'global!document',
    'tinymce.themes.mobile.ios.core.IosEvents',
    'tinymce.themes.mobile.ios.core.IosHacks',
    'tinymce.themes.mobile.ios.core.IosSetup',
    'tinymce.themes.mobile.ios.core.PlatformEditor',
    'tinymce.themes.mobile.ios.scroll.Scrollables',
    'tinymce.themes.mobile.ios.view.IosKeyboard',
    'tinymce.themes.mobile.ios.view.Thor',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.scroll.Scrollable',
    'tinymce.themes.mobile.touch.view.MetaViewport'
  ],

  function (
    Fun, Singleton, Struct, Focus, Element, Class, Css, document, IosEvents, IosHacks,
    IosSetup, PlatformEditor, Scrollables, IosKeyboard, Thor, Styles, Scrollable, MetaViewport
  ) {
    var create = function (platform, mask) {
      var meta = MetaViewport.tag();
           
      var priorState = Singleton.value();
      var scrollEvents = Singleton.value();

      var iosApi = Singleton.api();
      var iosEvents = Singleton.api();
      
      var enter = function () {
        mask.hide();
        var doc = Element.fromDom(document);
        PlatformEditor.getActiveApi(platform.editor).each(function (editorApi) {
          // TODO: Orientation changes.
          // orientation = Orientation.onChange();

          priorState.set({
            socketHeight: Css.getRaw(platform.socket, 'height'),
            iframeHeight: Css.getRaw(editorApi.frame(), 'height'),
            outerScroll: document.body.scrollTop
          });

          scrollEvents.set({
            // Allow only things that have scrollable class to be scrollable. Without this,
            // the toolbar scrolling gets prevented
            exclusives: Scrollables.exclusive(doc, '.' + Scrollable.scrollable())
          });

          Class.add(platform.container, Styles.resolve('fullscreen-maximized') );
          Thor.clobberStyles(platform.container, editorApi.body());
          meta.maximize();

          /* Make the toolbar scrollable */
          Css.set(platform.toolbar, 'overflow-x', 'auto');
          Scrollables.markAsHorizontal(platform.toolbar);
          Scrollable.register(platform.toolbar);

          Css.set(platform.socket, 'overflow', 'scroll');
          Css.set(platform.socket, '-webkit-overflow-scrolling', 'touch');

          Focus.focus(editorApi.body());

          var setupBag = Struct.immutableBag([
            'cWin',
            'ceBody',
            'socket',
            'toolstrip',
            'toolbar',
            'contentElement',
            'cursor',
            'keyboardType',
            'isScrolling'
          ], []);

          iosApi.set(
            IosSetup.setup(setupBag({
              'cWin': editorApi.win(),
              'ceBody': editorApi.body(),
              'socket': platform.socket,
              'toolstrip': platform.toolstrip,
              'toolbar': platform.toolbar,
              'contentElement': editorApi.frame(),
              'cursor': Fun.noop,
              'keyboardType': IosKeyboard.stubborn,
              'isScrolling': function () {
                return scrollEvents.get().exists(function (s) {
                  return s.socket.isScrolling();
                });
              }
            }))
          );

          IosHacks.stopTouchFlicker(editorApi.body());
          // updateOrientation();

          // syncHeight();
          iosApi.run(function (api) {
            api.syncHeight();
          });


          iosEvents.set(
            IosEvents.initEvents(editorApi, iosApi, platform.toolstrip, platform.socket)
          );
        });
      };

      var exit = function () {
        meta.restore();
        iosEvents.clear();
        iosApi.clear();

        mask.show();

        priorState.get().each(function (s) {
          s.socketHeight.each(function (h) { Css.set(platform.socket, 'height', h); });
          s.iframeHeight.each(function (h) { Css.set(platform.editor.getFrame(), 'height', h); });
          document.body.scrollTop = s.scrollTop;
        });
        priorState.clear();

        scrollEvents.get().each(function (s) {
          s.socket.destroy();
          s.exclusives.unbind();
        });
        scrollEvents.clear();

        Class.remove(platform.container, Styles.resolve('fullscreen-maximized') );
        Thor.restoreStyles();
        Scrollable.deregister(platform.toolbar);

        Css.remove(platform.socket, 'overflow'/*, 'scroll'*/);
        Css.remove(platform.socket, '-webkit-overflow-scrolling'/*, 'touch'*/);

        // Hide the keyboard and remove the selection so there isn't a blue cursor in the content
        // still even once exited.
        Focus.blur(platform.editor.getFrame());



        PlatformEditor.getActiveApi(platform.editor).each(function (editorApi) {
          editorApi.clearSelection();
        });
      };

      return {
        enter: enter,
        exit: exit
      };
    };

    return {
      create: create
    };
  }
);
