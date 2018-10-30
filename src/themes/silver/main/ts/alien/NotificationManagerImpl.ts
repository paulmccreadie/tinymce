/**
 * NotificationManagerImpl.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { GuiFactory, InlineView } from '@ephox/alloy';
import { Element } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';

import { Notification } from '../ui/general/Notification';
import { UiFactoryBackstage } from '../backstage/Backstage';

export default function (editor, extras, uiMothership) {
  const backstage: UiFactoryBackstage = extras.backstage;

  const getEditorContainer = function (editor) {
    return editor.inline ? editor.getElement() : editor.getContentAreaContainer();
  };

  // Since the viewport will change based on the present notifications, we need to move them all to the
  // top left of the viewport to give an accurate size measurement so we can position them later.
  const prePositionNotifications = function (notifications) {
    Arr.each(notifications, function (notification) {
      notification.moveTo(0, 0);
    });
  };

  const positionNotifications = function (notifications) {
    // TODO: make stacking notifications
    if (notifications.length > 0) {
      const firstItem = notifications.slice(0, 1)[0];
      const container = getEditorContainer(editor);
      firstItem.moveRel(container, 'tc-tc');
      Arr.each(notifications, function (notification, index) {
        if (index > 0) {
          notification.moveRel(notifications[index - 1].getEl(), 'bc-tc');
        }
      });
    }
  };

  const reposition = function (notifications) {
    prePositionNotifications(notifications);
    positionNotifications(notifications);
  };

  const open = function (settings, closeCallback) {
    const close = () => {
      closeCallback();
      InlineView.hide(notificationWrapper);
    };

    const notification = GuiFactory.build(
      Notification.sketch({
        text: settings.text,
        level: Arr.contains(['success', 'error', 'warning', 'info'], settings.type) ? settings.type : undefined,
        progress: settings.progressBar === true ? true : false,
        icon: Option.from(settings.icon),
        onAction: close,
        iconProvider: backstage.shared.providers.icons,
        translationProvider: backstage.shared.providers.translate
      })
    );

    const notificationWrapper = GuiFactory.build(
      InlineView.sketch({
        dom: {
          tag: 'div',
          classes: [ 'tox-notifications-container' ]
        },
        lazySink: extras.backstage.shared.getSink,
        fireDismissalEventInstead: { }
      })
    );

    uiMothership.add(notificationWrapper);

    if (settings.timeout) {
      setTimeout(() => {
        close();
      }, settings.timeout);
    }

    return {
      close,
      moveTo: (x: number, y: number) => {
        InlineView.showAt(notificationWrapper, {
          anchor: 'makeshift',
          x,
          y
        }, GuiFactory.premade(notification));
      },
      moveRel: (element: Element, rel) => {
        // TODO: fix anchor point banner AP-174
        // TODO: this should stack, TC-TC, BC-TC
        InlineView.showAt(notificationWrapper, extras.backstage.shared.anchors.banner(), GuiFactory.premade(notification));
      },
      text: (nuText: string) => {
        // check if component is still mounted
        Notification.updateText(notification, nuText);
      },
      settings,
      getEl: () => {
        // TODO: this is required to make stacking banners, should refactor getEl when AP-174 is implemented

      },
      progressBar: {
        value: (percent: number) => {
          Notification.updateProgress(notification, percent);
        }
      }
    };
  };

  const close = function (notification) {
    notification.close();
  };

  const getArgs = function (notification) {
    return notification.settings;
  };

  return {
    open,
    close,
    reposition,
    getArgs
  };
}