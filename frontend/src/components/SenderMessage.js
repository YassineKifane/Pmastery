
import React from "react";

export default function RecipientMessage({ date, text}) {
    const formatDate = (inputDate) => {
        const messageDate = new Date(inputDate);
        const options = { month: 'long', day: 'numeric' };
        return messageDate.toLocaleDateString('fr-FR', options);
    };

    const formatRelativeTime = (inputDate) => {
        const messageDate = new Date(inputDate);
        const now = new Date();
        const diffTime = now - messageDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            return "Hier";
        } else if (diffDays > 1) {
            return `il y a ${diffDays} jours`;
        } else {
            return "Aujourd'hui";
        }
    };

    const formatTime = (inputDate) => {
        const messageDate = new Date(inputDate);
        const hours = messageDate.getHours();
        const minutes = messageDate.getMinutes();
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
    };

    return (
        <div className="px-5 pt-3 pb-0 border-bottom col-12">
            <div className="d-flex align-items-center py-3">
                <div className="flex-grow-1">
                    <h6 className="fw-bold">Vous</h6>
                    <div className="small text-secondary">{formatDate(date)} ( {formatRelativeTime(date)})</div>
                </div>
            </div>

            <div className="flex-shrink-1">
                <p>{text}</p>
                <div className="d-flex justify-content-end">
                    <p className="text-secondary text-nowrap small">{formatTime(date)}</p>
                </div>
            </div>
        </div>
    );
}
