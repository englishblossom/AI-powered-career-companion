import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../axiosInstance";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  Select,
  TextField,
  Menu,
  Checkbox,
  ListItemText,
  IconButton,
} from "@mui/material";
import { ArrowUpward, FilterList } from "@mui/icons-material";
import TexResumeDialog from "./TexResumeDialog";
import "./Tracker.css";

interface JobEntry {
  jobdesc_id: string;
  timestamp: string;
  companyName: string;
  jobRole: string;
  job_description: string;
  status: string;
  s3_link: string;
}

const JobTrackerTable: React.FC = () => {
  const [data, setData] = useState<JobEntry[]>([]);
  const [openJobDesc, setOpenJobDesc] = useState(false);
  const [selectedJobDesc, setSelectedJobDesc] = useState<string>("");
  const [openEditPopup, setOpenEditPopup] = useState(false);
  const [selectedEditRow, setSelectedEditRow] = useState<JobEntry | null>(null);
  const [sortField, setSortField] = useState<keyof JobEntry | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [updateMessage, setUpdateMessage] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "Optimised Resume",
    "Applied",
    "Selected",
  ]);

  const [openTexDialog, setOpenTexDialog] = useState(false);
  const [texContent, setTexContent] = useState("");
  const [selectedTexJobId, setSelectedTexJobId] = useState<
    string | undefined
  >();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const filterMenuOpen = Boolean(anchorEl);

  const statusOptions = ["Optimised Resume", "Applied", "Selected", "Rejected"];
  const username =
    localStorage.getItem("username") || sessionStorage.getItem("username");

  const fetchData = async () => {
    try {
      // const response = await axios.get("http://localhost:8000/get-jobdesc", {
      //   params: { username },
      // });

      const response = await api.get("/get-jobdesc", {
        params: { username },
      });
      setData(response.data.entries);
    } catch (error) {
      console.error("Error fetching tracker data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  const handleViewClick = (desc: string) => {
    setSelectedJobDesc(desc);
    setOpenJobDesc(true);
  };

  const handleEditClick = (row: JobEntry) => {
    setSelectedEditRow(row);
    setOpenEditPopup(true);
  };

  const handleEditChange = async (field: keyof JobEntry, value: string) => {
    if (!selectedEditRow) return;

    const original = selectedEditRow;
    let updatedRow = { ...original, [field]: value };

    if (field === "timestamp") {
      const timePart = new Date().toISOString().split("T")[1];
      updatedRow.timestamp = `${value}T${timePart}`;
    }

    try {
      // await axios.post("http://localhost:8000/update-jobdesc", {
      //   ...updatedRow,
      //   Add_to_tracker: 1,
      //   username,
      // });

      await api.post("/update-jobdesc", {
        ...updatedRow,
        Add_to_tracker: 1,
        username,
      });

      const updatedData = data.map((row) =>
        row.jobdesc_id === updatedRow.jobdesc_id ? updatedRow : row
      );
      setData(updatedData);
      setSelectedEditRow(updatedRow);

      let msgParts = [];
      if (original.status !== updatedRow.status) msgParts.push("status");
      if (
        original.timestamp.split("T")[0] !== updatedRow.timestamp.split("T")[0]
      )
        msgParts.push("date");

      const msg =
        msgParts.length > 0
          ? `${msgParts.join(" and ")} updated successfully`
          : "";
      setUpdateMessage(msg);

      setTimeout(() => setUpdateMessage(""), 3000);
      setOpenEditPopup(false);
    } catch (error) {
      console.error("Error updating tracker data:", error);
    }
  };

  const handleViewResume = async (row: JobEntry) => {
    try {
      // const response = await axios.get("http://localhost:8000/get-s3-link", {
      //   params: { jobdesc_id: row.jobdesc_id },
      // });

      const response = await api.get("/get-s3-link", {
        params: { jobdesc_id: row.jobdesc_id },
        responseType: "text",
      });

      setTexContent(response.data);
      setSelectedTexJobId(row.jobdesc_id);
      setOpenTexDialog(true);
    } catch (error) {
      console.error("Error downloading .tex file:", error);
    }
    //   const freshLink = response.data.s3_link;
    //   window.open(freshLink, "_blank");
    // } catch (error) {
    //   console.error("Error fetching fresh S3 link:", error);
    // }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === "string" && typeof valB === "string") {
      return sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return 0;
  });

  const filteredData = sortedData.filter((entry) =>
    selectedStatuses.includes(entry.status)
  );

  const handleSort = (field: keyof JobEntry) => {
    setSortField(field);
    setSortDirection((prev) =>
      sortField === field && prev === "asc" ? "desc" : "asc"
    );
  };

  const handleFilterIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="d-flex justify-center items-start w-full tracker-area">
      <div className="w-full max-w-6xl table-container">
        {updateMessage && (
          <p className="text-green-600 font-semibold mb-2">{updateMessage}</p>
        )}

        <table className="table-auto w-full border border-collapse border-gray-300 pb-20">
          <thead className="bg-[#f8f0e8]">
            <tr>
              <th
                onClick={() => handleSort("timestamp")}
                className="border px-2"
              >
                <div className="flex items-center gap-1 cursor-pointer">
                  <span>Date Updated</span>
                  <ArrowUpward
                    fontSize="inherit"
                    style={{
                      transform:
                        sortField === "timestamp" && sortDirection === "desc"
                          ? "rotate(180deg)"
                          : "none",
                    }}
                  />
                </div>
              </th>
              <th
                onClick={() => handleSort("companyName")}
                className="border px-2"
              >
                <div className="flex items-center gap-1 cursor-pointer">
                  <span>Company</span>
                  <ArrowUpward
                    fontSize="inherit"
                    style={{
                      transform:
                        sortField === "companyName" && sortDirection === "desc"
                          ? "rotate(180deg)"
                          : "none",
                    }}
                  />
                </div>
              </th>
              <th onClick={() => handleSort("jobRole")} className="border px-2">
                <div className="flex items-center gap-1 cursor-pointer">
                  <span>Role</span>
                  <ArrowUpward
                    fontSize="inherit"
                    style={{
                      transform:
                        sortField === "jobRole" && sortDirection === "desc"
                          ? "rotate(180deg)"
                          : "none",
                    }}
                  />
                </div>
              </th>
              <th className="border px-2">Job Description</th>
              <th className="border px-2">Resume</th>
              <th className="border px-2">
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <IconButton size="small" onClick={handleFilterIconClick}>
                    <FilterList fontSize="inherit" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={filterMenuOpen}
                    onClose={handleFilterMenuClose}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem
                        key={status}
                        onClick={() => {
                          if (selectedStatuses.includes(status)) {
                            setSelectedStatuses((prev) =>
                              prev.filter((s) => s !== status)
                            );
                          } else {
                            setSelectedStatuses((prev) => [...prev, status]);
                          }
                        }}
                      >
                        <Checkbox checked={selectedStatuses.includes(status)} />
                        <ListItemText primary={status} />
                      </MenuItem>
                    ))}
                  </Menu>
                </div>
              </th>
              <th className="border px-2">Want to prep?</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.jobdesc_id} className="text-center">
                <td
                  className="border px-4 py-2 cursor-pointer"
                  onClick={() => handleEditClick(row)}
                >
                  {formatDate(row.timestamp)}
                </td>
                <td className="border px-4 py-2">{row.companyName}</td>
                <td className="border px-4 py-2">{row.jobRole}</td>
                <td
                  className="border px-4 py-2 text-blue-600 underline cursor-pointer view-underline"
                  onClick={() => handleViewClick(row.job_description)}
                >
                  View
                </td>
                <td className="border px-4 py-2">
                  <span
                    className="text-blue-600 underline cursor-pointer view-underline"
                    onClick={() => handleViewResume(row)}
                  >
                    View File
                  </span>
                </td>
                <td className="border px-4 py-2">
                  <div
                    className="border rounded-full px-3 py-1 inline-block cursor-pointer"
                    onClick={() => handleEditClick(row)}
                  >
                    {row.status} ▿
                  </div>
                </td>
                <td className="border px-4 py-2">🤖</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TexResumeDialog
        open={openTexDialog}
        onClose={() => setOpenTexDialog(false)}
        texContent={texContent}
        jobdescId={selectedTexJobId}
      />
      {/* Job Description Dialog */}
      <Dialog
        open={openJobDesc}
        onClose={() => setOpenJobDesc(false)}
        sx={{ paddingBottom: "200px" }}
      >
        <DialogTitle>Job Description</DialogTitle>
        <DialogContent>
          <pre style={{ whiteSpace: "pre-wrap" }}>{selectedJobDesc}</pre>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditPopup} onClose={() => setOpenEditPopup(false)}>
        <DialogTitle>Edit Job Entry</DialogTitle>
        <DialogContent>
          <div className="my-2">
            <Select
              fullWidth
              value={selectedEditRow?.status || ""}
              onChange={(e) => handleEditChange("status", e.target.value)}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div className="my-2">
            <TextField
              fullWidth
              label="Date Updated"
              type="date"
              value={
                selectedEditRow?.timestamp
                  ? new Date(selectedEditRow.timestamp)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) => handleEditChange("timestamp", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobTrackerTable;
