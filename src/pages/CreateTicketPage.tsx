import { useNavigate } from "react-router-dom";
import { useState } from "react";
import departments from "../data/departments.json";
import issueTypes from "../data/issueTypes.json";
import locations from "../data/locations.json";
import priorities from "../data/priorities.json";
import users from "../data/users.json";
import { CURRENT_USER_ID } from "../components/Header";

const CreateTicketPage = () => {
  const navigate = useNavigate();

  // ✅ Form State
  const [form, setForm] = useState({
    department: "",
    issue: "",
    location: "",
    priority: "",
    description: "",
    assigned_to: "",
    status: "New",
    attachment: [] as File[]
  });

  // ✅ Handle Input Change
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Reset assigned_to if department changes
    if (e.target.name === "department") {
      setForm(f => ({ ...f, assigned_to: "" }));
    }
  };

  // ✅ Handle File Upload
  const handleFileChange = (e: any) => {
    const files = Array.from(e.target.files) as File[];
    setForm((prev) => ({
      ...prev,
      attachment: [...prev.attachment, ...files]
    }));
  };

  const removeFile = (index: number) => {
    const updated = form.attachment.filter((_, i) => i !== index);
    setForm({ ...form, attachment: updated });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        title: form.issue,
        description: form.description,
        location: form.location,
        issue_type: form.issue,
        department: form.department,
        assigned_to: form.assigned_to,
        created_by: CURRENT_USER_ID,
        status: form.status
      };
      const response = await fetch(
        "http://localhost:3001/api/v1/tickets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert("Ticket created!");
        navigate("/");
      } else {
        alert("Error creating ticket");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>

      {/* Sidebar */}
      <div style={{
        width: "220px",
        background: "#f4f6f8",
        padding: "20px"
      }}>
        <h3>Menu</h3>
        <p style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          Dashboard
        </p>
        <p>Create Ticket</p>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>

        <h2>Create Ticket</h2>

        <div className="ticket-container">

  {/* LEFT SIDE */}
  <div className="form-left">

    {/* Department */}
    <label>Department</label>
    <select name="department" style={inputStyle} onChange={handleChange}>
      <option value="">Select Department</option>
      {departments.map((d, i) => (
        <option key={i} value={d}>{d}</option>
      ))}
    </select>

    {/* Issue */}
    <label>Issue / Type</label>
    <select name="issue" style={inputStyle} onChange={handleChange}>
      <option value="">Select Issue</option>
      {issueTypes.map((item: string, i: number) => (
        <option key={i} value={item}>{item}</option>
      ))}
    </select>

    {/* Location */}
    <label>Location</label>
    <select name="location" style={inputStyle} onChange={handleChange}>
      <option value="">Select Location</option>
      {locations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.building} - {loc.floor} - {loc.desk}
        </option>
      ))}
    </select>

    {/* Priority */}
    <label>Priority</label>
    <select name="priority" style={inputStyle} onChange={handleChange}>
      <option value="">Select Priority</option>
      {priorities.map((p, i) => (
        <option key={i} value={p}>{p}</option>
      ))}
    </select>

    {/* Assigned To */}
    <label>Assign To</label>
    <select
      name="assigned_to"
      style={inputStyle}
      value={form.assigned_to}
      onChange={handleChange}
      disabled={!form.department}
    >
      <option value="">Select User</option>
      {users.filter(u => u.department === form.department).map(u => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
    </select>

    {/* Status */}
    <label>Status</label>
    <select
      name="status"
      style={{ ...inputStyle, background: form.status === "New" ? "#e3f2fd" : form.status === "Inprogress" ? "#fff3cd" : "#e8f5e9", color: form.status === "New" ? "#1976d2" : form.status === "Inprogress" ? "#856404" : "#2e7d32" }}
      value={form.status}
      onChange={handleChange}
    >
      <option value="New">New</option>
      <option value="Inprogress">In Progress</option>
      <option value="Closed">Closed</option>
    </select>

    {/* Description */}
    <label>Description</label>
    <textarea
      name="description"
      className="textarea"
      placeholder="Enter details..."
      onChange={handleChange}
    />

    {/* Save Button */}
    <button className="save-btn" onClick={handleSubmit}>
      Save Ticket
    </button>

  </div>

  {/* RIGHT SIDE */}
  <div className="form-right">

    <label>Attachments</label>

    <div className="upload-box">

      <input
        type="file"
        multiple
        id="fileUpload"
        className="hidden-input"
        onChange={handleFileChange}
      />

      <div
        className="upload-area"
        onClick={() => document.getElementById("fileUpload")?.click()}
      >
        Drop files here or <span>choose file</span>
      </div>

      <div className="file-list">
        {form.attachment.map((file, index) => (
          <div key={index} className="file-item">
            <span>{file.name}</span>
            <span className="delete" onClick={() => removeFile(index)}>x</span>
          </div>
        ))}
      </div>

    </div>

  </div>

</div>
      </div>
    </div>
  );
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: "10px",
  padding: "8px"
};

export default CreateTicketPage;