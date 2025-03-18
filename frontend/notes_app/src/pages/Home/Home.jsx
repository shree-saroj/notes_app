import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNote from "./AddEditNote";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNoteImg from "../../assets/add_note.svg";
import NoNoteImg from "../../assets/no_data_found.svg";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMessage, setShowToastMessage] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [userInfo, setUserInfo] = useState(null);
  const [allNotes, setAllNotes] = useState([]);

  const navigate = useNavigate();

  const handleEdit = (noteData) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: noteData });
  };

  const handleShowToastMessage = (message, type) => {
    setShowToastMessage({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToastMessage = () => {
    setShowToastMessage({
      isShown: false,
      message: "",
    });
  };

  // Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance("/get_user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status == 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Get All Notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get_all_notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("Error Occured While Fetching Data!");
    }
  };

  // Delete Note
  const deleteNote = async (noteData) => {
    try {
      const response = await axiosInstance.delete(
        `/delete_note/${noteData._id}`
      );
      if (response.data && response.data.message) {
        handleShowToastMessage(response.data.message, "delete");
        getAllNotes();
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        console.log("Error Occured While Deleting Data!");
      }
    }
  };
  // Delete Note
  const updateNotePinStatus = async (noteData) => {
    try {
      const response = await axiosInstance.put(
        `/update_note_pinned/${noteData._id}`,
        {
          isPinned: !noteData.isPinned,
        }
      );
      if (response.data && response.data.message) {
        handleShowToastMessage(response.data.message, "add");
        getAllNotes();
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        console.log("Error Occured While Updating Note Pin Status!");
      }
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = allNotes.filter((note) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="container mx-auto">
        {allNotes.length > 0 ? (
          filteredNotes.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 mt-8">
              {filteredNotes.map((item, index) => (
                <NoteCard
                  key={item._id}
                  title={item.title}
                  date={item.createOn}
                  content={item.content}
                  tags={item.tags}
                  isPinned={item.isPinned}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteNote(item)}
                  onPinNote={() => updateNotePinStatus(item)}
                />
              ))}
            </div>
          ) : (
            <EmptyCard
              imgSrc={NoNoteImg}
              message={`Oops! No Data Found Matching Your Search.`}
            />
          )
        ) : (
          <EmptyCard
            imgSrc={AddNoteImg}
            message={`Start creating your first note! Click the 'Add' button to take down your thoughts, ideas, and remainders. Let's get started!`}
          />
        )}
      </div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        ariaHideApp={false}
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            background: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-auto"
      >
        <AddEditNote
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllNotes={getAllNotes}
          handleShowToastMessage={handleShowToastMessage}
        />
      </Modal>
      <Toast
        isShown={showToastMessage?.isShown}
        message={showToastMessage?.message}
        type={showToastMessage?.type}
        onClose={handleCloseToastMessage}
      />
    </>
  );
};

export default Home;
