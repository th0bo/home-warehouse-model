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

const dateRegExp = /(\d{2})\/(\d{2})\/(\d{4})/;

function getDriveFileId(name: string) {
  return DriveApp.getFilesByName(name).next().getId();
}