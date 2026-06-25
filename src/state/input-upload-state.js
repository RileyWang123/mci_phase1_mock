(function attachInputUploadState(global) {
  function createInputUploadState({ inputSources, uploadSourceNames }) {
    const uploadedFiles = new Map();
    const defaults = new Map(
      inputSources
        .filter((item) => uploadSourceNames.includes(item.source))
        .map((item) => [item.source, { quality: item.quality, issue: item.issue, tone: item.tone }]),
    );

    function findSource(sourceName) {
      return inputSources.find((item) => item.source === sourceName);
    }

    function resetUploadSources() {
      uploadedFiles.clear();
      defaults.forEach((defaultState, sourceName) => {
        const source = findSource(sourceName);
        if (source) {
          source.quality = defaultState.quality;
          source.issue = defaultState.issue;
          source.tone = defaultState.tone;
        }
      });
    }

    function setUploaded(sourceName, file) {
      uploadedFiles.set(sourceName, file);
      const source = findSource(sourceName);
      if (source) {
        source.quality = "Ready";
        source.tone = "done";
        source.issue = `Uploaded ${file.original_name}`;
      }
    }

    function applyBackendStatus(data) {
      resetUploadSources();
      data.sources?.forEach((sourceStatus) => {
        if (sourceStatus.latestFile) {
          setUploaded(sourceStatus.source, sourceStatus.latestFile);
        }
      });
    }

    return {
      getFile: (sourceName) => uploadedFiles.get(sourceName),
      setUploaded,
      applyBackendStatus,
    };
  }

  global.MciInputUploadState = {
    createInputUploadState,
  };
})(globalThis);
