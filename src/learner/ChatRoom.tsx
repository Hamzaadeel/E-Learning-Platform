import React, { useEffect, useState, useRef } from "react";
import { db } from "../config/firebase"; // Your Firebase config
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have an Auth context

interface ChatRoomProps {
  courseId: string; // Pass the course ID as a prop
}

const ChatRoom: React.FC<ChatRoomProps> = ({ courseId }) => {
  const { currentUser } = useAuth(); // Get the current user
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref for scrolling to the latest message

  if (!courseId) {
    return <div>Error: Course ID is not defined.</div>; // Display an error message
  }

  useEffect(() => {
    const messagesRef = collection(db, "courses", courseId, "chat");
    const q = query(messagesRef, orderBy("timestamp")); // Order by timestamp

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const messagesData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const message = { id: doc.id, ...doc.data() };
          // Fetch the user's name from the users collection
          const userDoc = await getDoc(doc(db, "users", message.senderId));
          message.senderName = userDoc.exists()
            ? userDoc.data().name
            : "Unknown User"; // Get the user's name
          return message;
        })
      );

      setMessages(messagesData);
      scrollToBottom(); // Scroll to the latest message
    });

    return () => unsubscribe(); // Clean up the listener
  }, [courseId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      // Add the message to Firestore
      await addDoc(collection(db, "courses", courseId, "chat"), {
        senderId: currentUser.uid,
        message: newMessage,
        timestamp: new Date().toISOString(), // Store as ISO string
      });

      setNewMessage(""); // Clear the input
    } catch (error) {
      console.error("Error sending message:", error); // Log any errors
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage(); // Send message on Enter key press
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 rounded-lg shadow-md mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-blue-100 p-2 rounded-lg mb-2">
            <strong>{msg.senderName}: </strong>
            <span>{msg.message}</span>
            <span className="text-xs text-gray-500 block">
              {new Date(msg.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
