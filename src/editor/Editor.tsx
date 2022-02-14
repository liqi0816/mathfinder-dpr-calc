import AceEditor from 'react-ace'; // important! must be the first import
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/theme-tomorrow';
import { nanoid } from 'nanoid/non-secure';
import React from 'react';

export class Editor extends AceEditor {
    public static defaultProps: typeof AceEditor.defaultProps = {
        ...AceEditor.defaultProps,
        theme: 'tomorrow',
        fontSize: 18,
        showPrintMargin: false,
        showGutter: false,
        setOptions: { showLineNumbers: false },
        width: '100%',
        height: '200px',
    };

    constructor(props: React.ComponentProps<typeof AceEditor>) {
        super(props.name ? props : { ...props, name: nanoid(10) });
    }

    componentDidMount() {
        super.componentDidMount();
        // (Chrome bug fixed) this will no longer leak memory
        // https://bugs.chromium.org/p/chromium/issues/detail?id=1220041
        const observer = new ResizeObserver(() => this.editor?.resize());
        observer.observe(this.refEditor);
    }
}

export const ReadonlyEditor: React.VFC<React.ComponentProps<typeof Editor>> = props => {
    const lines = props.value?.split('\n').map(line => line.trim());
    return (
        <Editor
            value={lines?.join('\n')}
            readOnly
            minLines={lines?.length}
            maxLines={lines?.length}
            highlightActiveLine={false}
            {...props}
        />
    );
};
