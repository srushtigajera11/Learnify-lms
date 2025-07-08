import { useOutletContext } from "react-router-dom";
import Profile from "../pages/Tutor/Profile";
const TutorProfileWrapper = () => {
  const user = useOutletContext();
  return <Profile user={user} />;
};

export default TutorProfileWrapper;
