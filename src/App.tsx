import AddCourseCategory from "./pages/Admin/coursecategories/AddCourseCategory"; 
import CourseCategoryList from "./pages/Admin/coursecategories/CourseCategoryList";
import EditCourseCategory from "./pages/Admin/coursecategories/EditCourseCategory"; 
import AddSubCourseCategory from "./pages/Admin/coursecategories/AddSubCourseCategory"; 
import EditSubCourseCategory from "./pages/Admin/coursecategories/EditSubCourseCategory";
import AddCoursePage from "./pages/Admin/courses/AddCourse";
import EditCoursePage from "./pages/Admin/courses/EditCourse"; 
import ViewCourse from "./pages/Admin/courses/ViewCourse";  
import AdminCourseList from "./pages/Admin/courses/List";  
import AddCourseChapter from "./pages/Admin/courses/AddCourseChapter";   

import AddUser from "./pages/Admin/users/AddUser";
import AssignUserRole from "./pages/Admin/users/AssignUserRole";
import UserAssignedRole from "./pages/Admin/users/UserAssignedRole";
import UserList from "./pages/Admin/users/UserList";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Courses from "./pages/Courses/List";
import AddCourseType from "./pages/Courses/AddCourseType";  
import EditCourseType from "./pages/Courses/EditCourseType";
import CourseTypeList from "./pages/Courses/CourseTypeList";
import SiteHome from "./pages/Home/Home";
import SignUpStepsOne from "./pages/SignUpSteps/SignUpStepsOne";
import SignUpStepsTwo from "./pages/SignUpSteps/SignUpStepsTwo";
import SignUpStepsThree from "./pages/SignUpSteps/SignUpStepsThree";
import RoleList from "./pages/Admin/role/RoleList";
import AddRole from "./pages/Admin/role/AddRole";
import EditRole from "./pages/Admin/role/EditRole";
import PermissionDenied from "./pages/errors/PermissionDenied"; 
import AddModule from "./pages/Admin/modules/AddModule";
import ModuleList from "./pages/Admin/modules/ModuleList";
import EditModule from "./pages/Admin/modules/EditModule";
import ProtectedRoute from "./routes/ProtectedRoute";
import EditUser from "./pages/Admin/users/EditUser";

// Courses in the frontend
import ViewCourseFrontEnd from "./pages/Courses/ViewCourse";
import ViewChapter from "./pages/Admin/courses/ViewChapter";

// Student Dashboard and components
import StudentDashboard from "./pages/Frontend/Student/StudentDashboard";
import CourseDetail from "./pages/Frontend/Student/CourseDetail";
import BatchList from "./pages/Frontend/Student/BatchList";
import LearnChapter from "./pages/Frontend/Student/LearnChapter";

import useAutoLogout from './hooks/useAutoLogout';

// Teacher Batches
import AddBatch from "./pages/Admin/batch/AddBatch";
import EditBatch from "./pages/Admin/batch/EditBatch"; 
import Batch from "./pages/Admin/batch/ListBatch";
import ViewBatch from "./pages/Admin/batch/ViewBatch";
import AddStudentToBatch from "./pages/Admin/batch/AddStudentToBatch";

// Admin Assignment
import CreateAssignmentPage from "./pages/Admin/assignment/CreateAssignmentPage";
import ListAssignmentsPage from "./pages/Admin/assignment/ListAssignmentsPage";
import EditAssignmentPage from "./pages/Admin/assignment/EditAssignmentPage";


//Admin Course, content and chapter
import ViewTopicDetail from "./pages/Admin/courses/ViewTopicDetail";
 

export default function App() {
  // Auto-logout handler component
  function AutoLogoutHandler() {
    // default 30 minutes
    useAutoLogout();
    return null;
  }
  return (
    <Router>
      <AutoLogoutHandler />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<SiteHome />} />
        {/* Auth Layout */}
        <Route path="/admin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />        

        <Route path="/SignUpStepsOne" element={<SignUpStepsOne />} /> 
        <Route path="/SignUpStepsTwo" element={<SignUpStepsTwo />} /> 
        <Route path="/SignUpStepsThree" element={<SignUpStepsThree />} />
         
        <Route path="/Student-Dashboard" element={<ProtectedRoute allowedRoles={["student"]} /> }>
          <Route index element={<StudentDashboard />} />
          <Route path="course/:id" element={<CourseDetail />} />
          <Route path="batches/:id" element={<BatchList />} /> 
          <Route path="learn/:id" element={<LearnChapter />} />
        </Route>


        // Courses in the frontend
        <Route path="/course/view/:id" element={<ViewCourseFrontEnd />} />

        {/* Dashboard Layout (protected) */}
        <Route element={<AppLayout />}>
        <Route path="/permission-denied" element={<PermissionDenied />} />
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin", "teacher", "student"]} />
            }
          >
            <Route index element={<Home />} />
          </Route>

          {/* Users */}
          <Route
            path="/users"
            element={<ProtectedRoute allowedRoles={["Admin"]} />}
          >
            <Route index element={<UserList />} />
            <Route path="add" element={<AddUser />} />
            <Route path=":id/edit" element={<EditUser />} />
            <Route path=":id/assign-role" element={<AssignUserRole />} />
            <Route path=":id/assigned-role" element={<UserAssignedRole />} />
          </Route>
          {/* Roles */}
          <Route
            path="/role"
            element={<ProtectedRoute allowedRoles={["Admin"]} />}
          >
            <Route index element={<RoleList />} />
            <Route path="add" element={<AddRole />} />
            <Route path="edit/:id" element={<EditRole />} />
          </Route>

          {/* Modules */}
          <Route
            path="/module"
            element={<ProtectedRoute allowedRoles={["Admin"]} />}
          >
            <Route index element={<ModuleList />} />
            <Route path="add" element={<AddModule />} />
            <Route path="edit/:id" element={<EditModule />} />
          </Route>

          {/* Courses */}
          <Route
            path="/courses"
            element={<ProtectedRoute allowedRoles={["Admin", "Teacher"]} />}
          >
            <Route index element={<Courses />} />
            <Route path="adminCourseList" element={<AdminCourseList />} /> 
            <Route path="add" element={<AddCoursePage />} />  
            <Route path="view/:id" element={<ViewCourse />} />
            <Route path="edit/:id" element={<EditCoursePage />} />
            <Route path="type/add" element={<AddCourseType />} />
            <Route path="type/list" element={<CourseTypeList />} />
            <Route path="type/edit/:id" element={<EditCourseType />} />
            <Route path="coursecategories/add" element={<AddCourseCategory />} />
            <Route path="coursecategories/list" element={<CourseCategoryList />} />
            <Route path="coursecategories/edit/:id" element={<EditCourseCategory />} /> 
            <Route path="coursecategories/addsubcat" element={<AddSubCourseCategory />} /> 
            <Route path="coursecategories/editsubcat/:id" element={<EditSubCourseCategory />} /> 
            <Route path=":id/add-chapter" element={<AddCourseChapter />} />
            <Route path=":id/chapters/:chapterId" element={<ViewChapter />} />         
            <Route path="chapters/topics/:id" element={<ViewTopicDetail />} />
          </Route>

          <Route
            path="/Batch"
            element={<ProtectedRoute allowedRoles={["Admin", "Teacher"]} />}
          >
            <Route index element={<Batch />} />
            <Route path="addBatch" element={<AddBatch />} />  
            <Route path="editBatch/:id" element={<EditBatch />} /> 
            <Route path="viewBatch/:id" element={<ViewBatch />} /> 
            <Route path="add-student/:id" element={<AddStudentToBatch />} />            
          </Route>

          <Route
            path="/Assignment"
            element={<ProtectedRoute allowedRoles={["Admin", "Teacher"]} />}
          >
            {/* <Route index element={<Assignment />} /> */}
            <Route path="add" element={<CreateAssignmentPage />} /> 
            <Route path="list" element={<ListAssignmentsPage />} />
            <Route path="edit/:id" element={<EditAssignmentPage />} />
            {/* <Route path="view/:id" element={<ViewAssignment />} />
            <Route path="add-student/:id" element={<AddStudentToAssignment />} /> */}
          </Route>
       

          {/* Profile */}
          <Route
            path="/profile"
            element={<ProtectedRoute allowedRoles={["Admin", "Teacher", "student"]} />}
          >
            <Route index element={<UserProfiles />} />
          </Route>

          {/* Calendar */}
          <Route
            path="/calendar"
            element={<ProtectedRoute allowedRoles={["Admin", "Teacher"]} />}
          >
            <Route index element={<Calendar />} />
          </Route>

          {/* Blank Page */}
          <Route
            path="/blank"
            element={<ProtectedRoute allowedRoles={["Admin"]} />}
          >
            <Route index element={<Blank />} />
          </Route>

          {/* Forms */}
          <Route
            path="/form-elements"
            element={<ProtectedRoute allowedRoles={["Admin", "teacher"]} />}
          >
            <Route index element={<FormElements />} />
          </Route>

          {/* Tables */}
          <Route
            path="/basic-tables"
            element={<ProtectedRoute allowedRoles={["Teacher"]} />}
          >
            <Route index element={<BasicTables />} />
          </Route>

          {/* UI Elements */}
          <Route
            path="/alerts"
            element={<ProtectedRoute allowedRoles={["Admin", "teacher", "student"]} />}
          >
            <Route index element={<Alerts />} />
          </Route>
          <Route
            path="/avatars"
            element={<ProtectedRoute allowedRoles={["Admin", "teacher", "student"]} />}
          >
            <Route index element={<Avatars />} />
          </Route>
          <Route
            path="/badge"
            element={<ProtectedRoute allowedRoles={["Admin", "teacher"]} />}
          >
            <Route index element={<Badges />} />
          </Route>
          <Route
            path="/buttons"
            element={<ProtectedRoute allowedRoles={["Admin", "teacher"]} />}
          >
            <Route index element={<Buttons />} />
          </Route>
          <Route
            path="/images"
            element={<ProtectedRoute allowedRoles={["Admin", "teacher", "student"]} />}
          >
            <Route index element={<Images />} />
          </Route>
          <Route
            path="/videos"
            element={<ProtectedRoute allowedRoles={["Admin", "teacher", "student"]} />}
          >
            <Route index element={<Videos />} />
          </Route>

          {/* Charts */}
          <Route
            path="/line-chart"
            element={<ProtectedRoute allowedRoles={["Admin", "teacher"]} />}
          >
            <Route index element={<LineChart />} />
          </Route>
          <Route
            path="/bar-chart"
            element={<ProtectedRoute allowedRoles={["Admin", "teacher"]} />}
          >
            <Route index element={<BarChart />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
