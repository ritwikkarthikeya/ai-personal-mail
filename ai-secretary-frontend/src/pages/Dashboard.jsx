import { getUser } from "../utils/auth";
import EmailList from "../components/EmailList";
import SummarizedEmails from "../components/SummarizedEmails";
import AskAssistant from "../components/AskAssistant";

export default function Dashboard() {
  const user = getUser();

  return (
    <div>
      <h2>Hello, {user?.name} 👋</h2>

      <EmailList />

      <AskAssistant />

      <SummarizedEmails />
    </div>
  );
}
