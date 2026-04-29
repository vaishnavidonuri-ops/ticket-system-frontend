import { useNavigate } from "react-router-dom";
import { useState } from "react";

// ✅ Import JSON files
import departments from "../data/departments.json";
import issueTypes from "../data/issueTypes.json";
import locations from "../data/locations.json";
import priorities from "../data/priorities.json";

const CreateTicketPage = () => {
  const navigate = useNavigate();

  // ✅ Form State
  const [form, setForm] = useState({
    department: "",
    // type: "",
    issue: "",
    location: "",
    priority: "",
    description: "",
    attachment: null as File | null
  });

  // ✅ Handle Input Change
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle File Upload
  const handleFileChange = (e: any) => {
    setForm({ ...form, attachment: e.target.files[0] });
  };

  // ✅ Handle Submit (for now just console)
  const handleSubmit = () => {
    const newTicket = {
      id: Date.now(),
      ...form,
      status: "Open"
    };

    console.log("New Ticket:", newTicket);

    // 👉 later we will save to localStorage

    navigate("/");
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

        <div style={{ maxWidth: "400px" }}>

          {/* Department */}
          <label>Department</label>
          <select name="department" style={inputStyle} onChange={handleChange}>
            <option value="">Select Department</option>
            {departments.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>

          {/* Type */}
          <label>Issue / Type</label>
          <select name="issue" style={inputStyle} onChange={handleChange}>
            <option value="">Select Issue</option>

            {issueTypes.map((item : string, i : number) => (
              <option key={i} value={item}>
                {item}
              </option>
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

          {/* Description */}
<label>Description</label>
<textarea
  name="description"
  className="textarea"
  placeholder="Enter details..."
  onChange={handleChange}
/>

          {/* Attachment */}
          <label>Attachment</label>
          <input type="file" style={inputStyle} onChange={handleFileChange} />

          {/* Button */}
          <button
            onClick={handleSubmit}
            style={{
              marginTop: "10px",
              padding: "10px",
              background: "green",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Save Ticket
          </button>

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