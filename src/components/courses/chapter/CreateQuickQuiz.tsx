import QuickQuizForm from './QuickQuizForm';

export default function CreateQuickQuiz({ submitEndpoint, onCreated }: { submitEndpoint?: string; onCreated?: (q: any) => void }) {
  return <QuickQuizForm submitEndpoint={submitEndpoint} method="POST" onCreated={onCreated} />;
}
