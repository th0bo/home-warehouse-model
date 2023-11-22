const tasksModule =
  Tasks.Tasks as GoogleAppsScript.Tasks.Collection.TasksCollection;
const taskListsModule =
  Tasks.Tasklists as GoogleAppsScript.Tasks.Collection.TasklistsCollection;

const testListAsTasks = () => {
  ListAsTasks.addItems([
    "bananes",
    "avoine",
    "oeufs",
    "lait",
    "yahourts",
    "pommes",
    "carottes",
  ]);
};

namespace ListAsTasks {
  const taskListName = "Courses";
  const taskListId = (() => {
    for (const taskList of taskListsModule.list().items ?? []) {
      if (taskList.title === taskListName) {
        return taskList.id as string;
      }
    }
    return taskListsModule.insert({ title: taskListName }).id as string;
  })();

  const getExistingItems = () => {
    const tasks =
      tasksModule.list(taskListId, {
        showCompleted: true,
        showHidden: true,
      }).items ?? [];

    const result = new Map<string, string>();
    for (const task of tasks) {
      result.set(task.title as string, task.id as string);
    }

    return result;
  };

  export const addItems = (itemLabels: string[]) => {
    const existingItems = getExistingItems();

    let previousTaskId: string | undefined;

    itemLabels.forEach((itemLabel, pos) => {
      const task = {
        title: itemLabel,
        status: "needsAction",
        hidden: false,
        position: pos.toString().padStart(20, "0"),
      };
      let currentTaskId = existingItems.get(itemLabel);
      if (currentTaskId !== undefined) {
        tasksModule.patch(task, taskListId, currentTaskId);
        Logger.log(`Patched task ${itemLabel} - ${currentTaskId}.`);
      } else {
        currentTaskId = tasksModule.insert(task, taskListId).id as string;
        Logger.log(`Created task ${itemLabel} - ${currentTaskId}.`);
      }
      tasksModule.move(taskListId, currentTaskId, { previous: previousTaskId });
      Logger.log(`Moved task ${currentTaskId} just after ${previousTaskId}.`);
      previousTaskId = currentTaskId;
    });
  };
}
