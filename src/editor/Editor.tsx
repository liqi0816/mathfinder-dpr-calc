import 'ace-builds';
import type { Ace } from 'ace-builds';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/theme-tomorrow';
import uniqueId from 'lodash/uniqueId';
import React from 'react';
import AceEditor from 'react-ace';

interface TokenizerUpdateEvent {
    first: number;
    last: number;
    session: Ace.EditSession;
}

declare class MonkeyPatchExtender extends React.Component<{ onTokenizerUpdate?: (event: TokenizerUpdateEvent) => void }> {}

export class Editor extends (AceEditor as typeof MonkeyPatchExtender &
    typeof AceEditor &
    (new (..._: any) => MonkeyPatchExtender & AceEditor)) {
    public static defaultProps: typeof AceEditor.defaultProps = Object.defineProperties(
        {
            ...AceEditor.defaultProps,
            theme: 'tomorrow',
            fontSize: 18,
            showPrintMargin: false,
            showGutter: false,
            setOptions: { showLineNumbers: false },
            width: '100%',
            height: '200px',
        },
        {
            name: {
                enumerable: true,
                get: () => uniqueId('editor'),
            },
        }
    );

    componentDidMount() {
        super.componentDidMount();
        // (Chrome bug fixed) this will no longer leak memory
        // https://bugs.chromium.org/p/chromium/issues/detail?id=1220041
        const observer = new ResizeObserver(() => this.editor?.resize());
        observer.observe(this.refEditor);
        // attach tokenizerUpdate to current and future session
        const attachSession = ({ session }: { session: Ace.EditSession }) => {
            session.on('tokenizerUpdate', ({ data: { first, last } }) => {
                this.props.onTokenizerUpdate?.({ first, last, session });
            });
        };
        this.editor.on('changeSession', attachSession);
        attachSession(this.editor);
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
