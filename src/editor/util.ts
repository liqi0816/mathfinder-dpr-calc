import { Ace } from 'ace-builds';

export function* iterateEditor(session: Ace.EditSession) {
    const lines = session.getLength();
    for (let i = 0; i < lines; i++) {
        yield session.getTokens(i);
    }
}
