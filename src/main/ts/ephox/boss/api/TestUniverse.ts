import Attribution from '../mutant/Attribution';
import Comparator from '../mutant/Comparator';
import Creator from '../mutant/Creator';
import Down from '../mutant/Down';
import Insertion from '../mutant/Insertion';
import Locator from '../mutant/Locator';
import Logger from '../mutant/Logger';
import Properties from '../mutant/Properties';
import Query from '../mutant/Query';
import Removal from '../mutant/Removal';
import Styling from '../mutant/Styling';
import Tracks from '../mutant/Tracks';
import Up from '../mutant/Up';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Universe } from './Universe';



export default function (raw): Universe<any, any> {
  var content = Tracks.track(raw, Option.none());

  // NOTE: The top point might change when we are wrapping.
  var wrap = function (anchor, wrapper) {
    Insertion.wrap(anchor, wrapper);
    content.parent.fold(Fun.noop, function (p) {
      content = p;
    });
  };

  var find = function (root, id) {
    return Locator.byId(root, id);
  };

  var get = function () {
    return content;
  };

  var shortlog = function (f) {
    return f !== undefined ? Logger.custom(content, f) : Logger.basic(content);
  };

  return {
    up: Fun.constant({
      selector: Up.selector,
      closest: Up.closest,
      predicate: Up.predicate,
      all: Up.all,
      top: Up.top
    }),
    down: Fun.constant({
      selector: Down.selector,
      predicate: Down.predicate
    }),
    styles: Fun.constant({
      get: Styling.get,
      set: Styling.set,
      getRaw: Styling.getRaw,
      remove: Styling.remove
    }),
    attrs: Fun.constant({
      get: Attribution.get,
      set: Attribution.set,
      remove: Attribution.remove,
      copyTo: Attribution.copyTo
    }),
    insert: Fun.constant({
      before: Insertion.before,
      after: Insertion.after,
      append: Insertion.append,
      appendAll: Insertion.appendAll,
      afterAll: Insertion.afterAll,
      prepend: Insertion.prepend,
      wrap: wrap
    }),
    remove: Fun.constant({
      unwrap: Removal.unwrap,
      detach: Removal.detach,
      remove: Removal.remove
    }),
    create: Fun.constant({
      nu: Creator.nu,
      text: Creator.text,
      clone: Creator.clone
    }),
    query: Fun.constant({
      comparePosition: Query.comparePosition,
      nextSibling: Query.nextSibling,
      prevSibling: Query.prevSibling
    }),
    property: Fun.constant({
      children: Properties.children,
      name: Properties.name,
      parent: Properties.parent,
      isText: Properties.isText,
      isComment: Properties.isComment,
      isElement: Properties.isElement,
      setText: Properties.setText,
      getText: Properties.getText,
      isEmptyTag: Properties.isEmptyTag,
      isBoundary: Properties.isBoundary
    }),
    eq: Comparator.eq,
    is: Comparator.is,
    find: find,
    get: get,
    shortlog: shortlog
  };
};