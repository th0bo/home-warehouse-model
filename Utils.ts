const scriptingLabel = "scripting";

function getLabeledThreadsIds() {
  return GmailApp.getInboxThreads()
    .filter((thread) =>
      thread
        .getLabels()
        .map((label) => label.getName())
        .includes(scriptingLabel)
    )
    .map((thread) => thread.getId());
}
