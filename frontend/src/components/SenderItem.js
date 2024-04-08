
import React from "react";

export default function SenderItem({ sender, role, onClick , active }) {
    return (
        <a href="#" className={`list-group-item border-bottom p-3  ${active ? 'bg-blue bg-blue:hover' : ''}`} onClick={onClick}>
            <div className="d-flex align-items-start">
                <div className="flex-grow-1 ms-3">
                    {sender}<br/>
                    {role}
                </div>
            </div>
        </a>
    );
}


