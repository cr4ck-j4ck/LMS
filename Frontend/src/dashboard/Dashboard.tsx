import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Fab,
  Avatar,
  Tooltip,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonComponent from "./Button";

interface ButtonConfig {
  id: string;
  heading: string;
  url: string;
  endpoint: string;
  inputLabels?: string[];
  hasLoading: boolean;
}

const buttonConfigs: ButtonConfig[] = [
  {
    id: "assignment",
    heading: "Get Assignment (Classroom)",
    url: "https://classroom.googleapis.com/v1/courses",
    endpoint: "google-api",
    hasLoading: true,
  },
  {
    id: "courseWork",
    heading: "Get Course Work (Classroom)",
    url: "https://classroom.googleapis.com/v1/courses/{input0}/courseWork",
    endpoint: "google-api",
    inputLabels: ["Enter Course ID"],
    hasLoading: true,
  },
  {
    id: "driveData",
    heading: "Get Drive Data (Classroom)",
    url: "https://www.googleapis.com/drive/v3/files/{input0}?alt=media",
    endpoint: "google-api",
    inputLabels: ["Enter File ID"],
    hasLoading: false,
  },
  {
    id: "classroomSubmissions",
    heading: "Get Submission of A Course",
    url: "https://classroom.googleapis.com/v1/courses/{input0}/courseWork/{input1}/studentSubmissions",
    endpoint: "google-api",
    inputLabels: ["Enter Course Id", "Enter Course Work ID"],
    hasLoading: false,
  },
  {
    id: "courseStudents",
    heading: "Get Course Students",
    url: "https://classroom.googleapis.com/v1/courses/{input0}/students",
    endpoint: "google-api",
    inputLabels: ["Enter Course ID for Students"],
    hasLoading: false,
  },
  {
    id: "teachersList",
    heading: "Get Teachers List",
    url: "https://classroom.googleapis.com/v1/courses/{input0}/teachers",
    endpoint: "google-api",
    inputLabels: ["Enter Course ID"],
    hasLoading: false,
  },
  {
    id: "specificStudent",
    heading: "Get Specific Student",
    url: "https://classroom.googleapis.com/v1/courses/{input0}/students/{input1}",
    endpoint: "google-api",
    inputLabels: ["Enter Course ID", "Enter User ID"],
    hasLoading: false,
  },
  {
    id: "moodleCourses",
    heading: "Get Moodle(Courses)",
    url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=core_course_get_courses&moodlewsrestformat=json",
    endpoint: "moodle-api",
    hasLoading: false,
  },
  {
    id: "moodleSyllabus",
    heading: "Get Moodle Syllabus",
    url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid={input0}",
    endpoint: "moodle-api",
    inputLabels: ["Enter Submission File ID"],
    hasLoading: false,
  },
  {
    id: "moodleSubmissions",
    heading: "Get Moodle Assignment Submissions",
    url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=mod_assign_get_submissions&moodlewsrestformat=json&assignmentids[0]={input0}",
    // url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json",
    endpoint: "moodle-api",
    inputLabels: ["Enter Assignment ID"],
    hasLoading: false,
  },
  {
    id: "moodleSubmissionAttachment",
    heading: "Get Moodle Assignment Submission Content",
    // url: "{input0}?token=TOKEN_HERE",
    // url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json",
    url: "https://cr4ck-j4ck.moodlecloud.com/webservice/pluginfile.php/104/assignsubmission_file/submission_files/2/isPalindrome.txt?token=YOUR_TOKEN&wstoken=TOKEN_HERE",
    endpoint: "moodle-api",
    inputLabels: ["Enter File URL"],
    hasLoading: false,
  },
  {
    id: "canvasCourses",
    heading: "Fetch all Canvas Courses",
    url: "/api/v1/courses",
    endpoint: "canvas-api",
    hasLoading: true,
  },
  {
    id: "canvasEnrollments",
    heading: "List enrollments in the courses",
    url: "/api/v1/courses/{input0}/enrollments",
    endpoint: "canvas-api",
    inputLabels: ["Enter Course ID"],
    hasLoading: true,
  },
  {
    id: "canvasSpecificStudent",
    heading: "Get User Specific Info",
    url: "/api/v1/users/{input0}/profile",
    endpoint: "canvas-api",
    inputLabels: ["Enter User ID"],
    hasLoading: true,
  },
  {
    id: "canvasCourseAssignments",
    heading: "Get Course Assignments",
    url: "/api/v1/courses/{input0}/assignments",
    endpoint: "canvas-api",
    inputLabels: ["Enter Course ID"],
    hasLoading: true,
  },
  {
    id: "canvasGetSubmissions",
    heading: "Get Submissions Of students",
    url: "/api/v1/courses/{input0}/assignments/{input1}/submissions",
    endpoint: "canvas-api",
    inputLabels: ["Enter Course ID","Enter assignment ID"],
    hasLoading: true,
  }
];

const Dashboard: React.FC = () => {
  const [responses, setResponses] = useState<Record<string, string | null>>({});

  const [inputs, setInputs] = useState<Record<string, string>>({});

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  const handleServerClick = async (url: string, endPoint: string, setLoadingState: (loading: boolean) => void, buttonId: string) => {
    setLoadingState(true);
    try {
      console.log(url);
      const res = await axios.post(
        `http://localhost:3000/${endPoint}`,
        {
          url,
        },
        {
          withCredentials: true,
        }
      );
      console.log(res.data)

      
      let responseData = "";
      if (endPoint === "google-api") {
        // Handle Google API responses
        if (url.includes("/courses") && !url.includes("/courseWork") && !url.includes("/students") && !url.includes("/teachers")) {
          responseData = `(${res.data.courses[0].id} & ${res.data.courses[0].name}\n) -- (${res.data.courses[1].id} & ${res.data.courses[1].name}\n)`;
        } else if (url.includes("/courseWork")) {
          responseData = `(${res.data.courseWork[0].title} & ${res.data.courseWork[0].description}\n) -- (${res.data.courseWork[0].materials[0].driveFile.driveFile.title} & ${res.data.courseWork[0].materials[0].driveFile.driveFile.id}\n)`;
        } else {
          responseData = res.data.id || res.data;
        }
      } else if (endPoint === "moodle-api") {
        
        responseData = res.data.id || res.data;
      }

      
      setResponses(prev => ({ ...prev, [buttonId]: responseData }));

    } catch (err) {
      console.error("Failed to fetch assignments", err);
    } finally {
      setLoadingState(false);
    }
  };

  const updateInput = (buttonId: string, value: string) => {
    setInputs(prev => ({ ...prev, [buttonId]: value }));
  };

  const setLoadingState = (buttonId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [buttonId]: loading }));
  };

  const getDynamicUrl = (config: ButtonConfig): string => {
    if (config.inputLabels) {
      let url = config.url;
      config.inputLabels.forEach((_, index) => {
        const inputValue = inputs[`${config.id}_${index}`] || "";
        url = url.replace(`{input${index}}`, inputValue);
      });
      return url;
    }
    return config.url;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Classroom
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{
              mr: 2,
              borderRadius: 6,
              fontWeight: 700,
              px: 3,
              py: 1,
              fontSize: 18,
              background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
              boxShadow: 3,
              transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
              ":hover": {
                transform: "scale(1.08)",
                boxShadow: 8,
                background: "linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)",
              },
            }}
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </Button>
          <Tooltip title="Account">
            <IconButton color="inherit">
              <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            mb: 4,
          }}
        >
          {buttonConfigs.map((config) => (
            <ButtonComponent
              key={config.id}
              heading={config.heading}
              response={responses[config.id] || null}
              url={getDynamicUrl(config)}
              endpoint={config.endpoint}
              buttonId={config.id}
              inputFields={config.inputLabels?.map((label, index) => ({
                label,
                value: inputs[`${config.id}_${index}`] || "",
                onChange: (value: string) => updateInput(`${config.id}_${index}`, value)
              }))}
              onServerClick={handleServerClick}
              setLoadingState={(loading) => setLoadingState(config.id, loading)}
              loading={loadingStates[config.id] || false}
            />
          ))}
        </Box>

        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: "fixed", bottom: 32, right: 32, boxShadow: 6 }}
        >
          <AddIcon />
        </Fab>
      </Box>
    </Box>
  );
};

export default Dashboard;