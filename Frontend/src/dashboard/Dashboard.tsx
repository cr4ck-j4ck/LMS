import React from "react";
import {
  Box,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { useState } from "react";
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
    id: "moodleCourses",
    heading: "Get Moodle(Courses)",
    url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=core_course_get_courses&moodlewsrestformat=json",
    endpoint: "moodle-api",
    hasLoading: false,
  },
  {
    id: "moodleSyllabus",
    heading: "Get Moodle Syllabus",
    // url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=mod_assign_get_assignments&courseids[0]={input0}&moodlewsrestformat=json",
    url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=${input0}&options[0][name]=includestealthmodules&options[0][value]=1",
    endpoint: "moodle-api",
    inputLabels: ["Enter Submission File ID"],
    hasLoading: false,
  },
  {
    id: "moodleSubmissions",
    heading: "Get Moodle Submissions",
    url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=mod_assign_get_submissions&moodlewsrestformat=json&assignmentids[0]={input0}",
    endpoint: "moodle-api",
    inputLabels: ["Enter Assignment ID"],
    hasLoading: false,
  },
  {
    id: "moodleSpecificStudent",
    heading: "Get Moodle Specific Student",
    url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=core_user_get_users&criteria[0][key]=id&criteria[0][value]={input0}&moodlewsrestformat=json",
    endpoint: "moodle-api",
    inputLabels: ["Enter student Id"],
    hasLoading: false,
  },
  {
    id: "moodleSubmissionAttachment",
    heading: "Get Moodle Assignment Submission Content",
    // url: "{input0}?token=TOKEN_HERE",
    url: "https://cr4ck-j4ck.moodlecloud.com/webservice/rest/server.php?wstoken=TOKEN_HERE&wsfunction=mod_assign_get_assignments&moodlewsrestformat=json&courseids[0]={input0}",    
    endpoint: "moodle-api",
    inputLabels: ["Enter Course ID"],
    hasLoading: false,
  },
  {
    id: "moodleFileURLDownload",
    heading: "Get Moodle File Download",
    url: "{input0}?token=TOKEN_HERE",
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
    id: "canvasSyllabus",
    heading: "Fetch all Syllabus of Canva Course",
    url: "/api/v1/courses/{input0}?include[]=syllabus_body",
    endpoint: "canvas-api",
    inputLabels: ["Enter Course ID"],
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
    inputLabels: ["Enter Course ID", "Enter assignment ID"],
    hasLoading: true,
  },
  {
    id: "getDataExtracted",
    heading: "Get Extracted text of the File",
    url: "https://canvas.instructure.com/files/305165318/download?download_frd=1&verifier=YTyqNXz9VvBkXEK1vy7V3rlDuzIVMyWtCgsZCbEk",
    endpoint: "extract-text",
    inputLabels: ["Enter Kuch Bhi nahi"],
    hasLoading: true,
  }
];

const Dashboard: React.FC = () => {
  const [responses, setResponses] = useState<Record<string, string | null>>({});

  const [inputs, setInputs] = useState<Record<string, string>>({});

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});


  const handleServerClick = async (url: string, endPoint: string, setLoadingState: (loading: boolean) => void, buttonId: string) => {
    setLoadingState(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/${endPoint}`,
        {
          url,
        },
        {
          withCredentials: true,
          
        }
      );
      

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