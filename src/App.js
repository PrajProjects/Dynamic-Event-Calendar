import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { CSVLink } from "react-csv";
import "./App.css";

// Days of the week
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

Modal.setAppElement("#root");

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", startTime: "", endTime: "", description: "", type: "work" });
  const [filterKeyword, setFilterKeyword] = useState("");

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem("events")) || {};
    setEvents(savedEvents);
  }, []);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
  };

  const openModal = (date) => {
    setSelectedDate(date);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setNewEvent({ name: "", startTime: "", endTime: "", description: "", type: "work" });
  };

  const addEvent = () => {
    if (!newEvent.name || !newEvent.startTime || !newEvent.endTime) return alert("All fields except description are required.");
    const dateKey = selectedDate.toDateString();
    const dayEvents = events[dateKey] || [];

    // Check for overlapping events
    for (const event of dayEvents) {
      if (
        (newEvent.startTime >= event.startTime && newEvent.startTime < event.endTime) ||
        (newEvent.endTime > event.startTime && newEvent.endTime <= event.endTime)
      ) {
        return alert("Event times overlap!");
      }
    }

    const updatedEvents = { ...events, [dateKey]: [...dayEvents, newEvent] };
    setEvents(updatedEvents);
    closeModal();
  };

  const deleteEvent = (index) => {
    const dateKey = selectedDate.toDateString();
    const updatedEvents = { ...events };
    updatedEvents[dateKey].splice(index, 1);
    if (!updatedEvents[dateKey].length) delete updatedEvents[dateKey];
    setEvents(updatedEvents);
  };

  const filterEvents = (keyword) => {
    if (!keyword) return events[selectedDate.toDateString()] || [];
    return (events[selectedDate.toDateString()] || []).filter((event) => event.name.toLowerCase().includes(keyword.toLowerCase()));
  };

  const exportEvents = () => {
    const allEvents = [];
    Object.keys(events).forEach((date) => {
      events[date].forEach((event) => allEvents.push({ date, ...event }));
    });
    return allEvents;
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="app">
      <header>
        <h1>Dynamic Event Calendar</h1>
        <div className="navigation">
          <button onClick={handlePrevMonth}>Previous</button>
          <h2>
            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
          </h2>
          <button onClick={handleNextMonth}>Next</button>
        </div>
      </header>

      <div className="calendar">
        {days.map((day) => (
          <div key={day} className="day-label">
            {day}
          </div>
        ))}
        {Array.from({ length: startDay }, (_, i) => (
          <div key={`empty-${i}`} className="empty"></div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          return (
            <div
              key={day}
              className={`day ${date.toDateString() === new Date().toDateString() ? "today" : ""}`}
              onClick={() => openModal(date)}
            >
              {day}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Event Modal">
          <h2>Events on {selectedDate.toDateString()}</h2>
          <input
            type="text"
            placeholder="Search events"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
          <div className="event-list">
            {filterEvents(filterKeyword).map((event, index) => (
              <div key={index} className="event">
                <strong>{event.name}</strong>
                <p>{event.startTime} - {event.endTime}</p>
                <p>{event.description}</p>
                <button onClick={() => deleteEvent(index)}>Delete</button>
              </div>
            ))}
          </div>
          <hr />
          <h3>Add New Event</h3>
          <input
            type="text"
            placeholder="Event Name"
            value={newEvent.name}
            onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          />
          <input
            type="time"
            value={newEvent.startTime}
            onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
          />
          <input
            type="time"
            value={newEvent.endTime}
            onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
          />
          <textarea
            placeholder="Description (Optional)"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          ></textarea>
          <button onClick={addEvent}>Add Event</button>
          <button onClick={closeModal}>Close</button>
        </Modal>
      )}

      <footer>
        <CSVLink data={exportEvents()} filename="events.csv">
          Export as CSV
        </CSVLink>
      </footer>
    </div>
  );
};

export default App;
