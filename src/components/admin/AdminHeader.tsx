import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => navigate("/identify")}
        className="text-white hover:text-gray-200 flex items-center"
      >
        <ArrowLeft size={24} />
        <span className="ml-2">Back</span>
      </button>
      <h1 className="text-3xl font-bold text-white">{title}</h1>
    </div>
  );
}
