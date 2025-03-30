import AceEditor from "react-ace";

// Import ace modes and themes
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  mode?: string;
  theme?: string;
  width?: string;
  height?: string;
  fontSize?: number;
  showPrintMargin?: boolean;
  showGutter?: boolean;
  highlightActiveLine?: boolean;
  readOnly?: boolean;
  wrapEnabled?: boolean;
  enableBasicAutocompletion?: boolean;
  enableLiveAutocompletion?: boolean;
  editorProps?: any;
}

export const Editor = ({
  value,
  onChange,
  mode = "javascript",
  theme = "github",
  width = "100%",
  height = "300px",
  fontSize = 14,
  showPrintMargin = false,
  showGutter = true,
  highlightActiveLine = true,
  readOnly = false,
  wrapEnabled = true,
  enableBasicAutocompletion = true,
  enableLiveAutocompletion = true,
  editorProps = { $blockScrolling: true },
}: EditorProps) => {
  return (
    <AceEditor
      mode={mode}
      theme={theme}
      value={value}
      onChange={onChange}
      width={width}
      height={height}
      fontSize={fontSize}
      showPrintMargin={showPrintMargin}
      showGutter={showGutter}
      highlightActiveLine={highlightActiveLine}
      readOnly={readOnly}
      wrapEnabled={wrapEnabled}
      enableBasicAutocompletion={enableBasicAutocompletion}
      enableLiveAutocompletion={enableLiveAutocompletion}
      editorProps={editorProps}
      setOptions={{
        useWorker: false,
        showLineNumbers: true,
      }}
    />
  );
};
