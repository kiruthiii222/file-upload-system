import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://localhost:5000");

function App() {
  const [files, setFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDocuments();
    fetchNotifications();

    socket.on("notification", (data) => {
      toast.success(data.message);

      setNotifications((prev) => [data, ...prev]);
    });
  }, []);

  const fetchDocuments = async () => {
    const res = await axios.get("http://localhost:5000/documents");

    setDocuments(res.data);
  };

  const fetchNotifications = async () => {
    const res = await axios.get("http://localhost:5000/notifications");

    setNotifications(res.data);
  };

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);

    setFiles(
      selectedFiles.map((file) => ({
        name: file.name,
        progress: 0,
        status: "Uploading",
      }))
    );

    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    if (selectedFiles.length > 3) {
      toast.info(
        `Upload in progress — processing ${selectedFiles.length} files in background`
      );
    }

    await axios.post("http://localhost:5000/upload", formData, {
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        setFiles((prev) =>
          prev.map((file) => ({
            ...file,
            progress: percent,
            status: percent === 100 ? "Completed" : "Uploading",
          }))
        );
      },
    });

    fetchDocuments();
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Livvic" }}>
      <ToastContainer />

      <h1>Document Dashboard</h1>

      <input type="file" multiple onChange={handleUpload} />

      <h2>Uploads</h2>

      {files.map((file, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <p>{file.name}</p>

          <p>{file.status}</p>

          <div
            style={{
              background: "#ddd",
              height: "20px",
            }}
          >
            <div
              style={{
                width: `${file.progress}%`,
                background: "blue",
                height: "20px",
                color: "white",
              }}
            >
              {file.progress}%
            </div>
          </div>
        </div>
      ))}

      <h2>Documents</h2>

      {documents.map((doc, index) => (
        <div key={index}>
          <p>{doc.name}</p>
        </div>
      ))}

      <h2>Notifications</h2>

      {notifications.map((n, index) => (
        <div key={index}>
          <p>{n.message}</p>
        </div>
      ))}
    </div>
  );
}

export default App;