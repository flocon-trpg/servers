export const TEST = process.env.customKey === 'test';
export const volumeCap = 2;

// HACK: 本来はtriggerSubMenuActionはundefinedもしくは'hover'にしたいが、前のSubMenuが閉じず2個以上開かれた状態になってしまうバグがあるようなので暫定的に'click'にしている。antdでこのバグが直ったらundefinedか'hover'に置き換える
export const defaultTriggerSubMenuAction = 'click' as const;
