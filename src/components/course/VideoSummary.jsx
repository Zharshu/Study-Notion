import React, { useState } from 'react';
import { MdSummarize, MdLightbulb, MdAccessTime, MdMenuBook } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import './VideoSummary.css';

const VideoSummary = ({ aiSummary, playerRef }) => {
  const [activeTab, setActiveTab] = useState('summary');

  // Handle loading state
  if (!aiSummary || aiSummary.status === 'pending') {
    return (
      <div className="mt-6 rounded-lg border border-richblack-700 bg-richblack-800 p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-100"></div>
          <p className="text-richblack-100">🤖 AI is analyzing this video... This may take 30-60 seconds.</p>
        </div>
      </div>
    );
  }

  // Handle failed state
  if (aiSummary.status === 'failed') {
    return (
      <div className="mt-6 rounded-lg border border-richblack-700 bg-richblack-800 p-6">
        <p className="text-richblack-300">
          AI summary is currently unavailable. Please watch the full video for content.
        </p>
      </div>
    );
  }

  // Handle no summary
  if (!aiSummary.summary) {
    return null;
  }

  // Handle timestamp click - seek video to specific time
  const handleTimestampClick = (timeInSeconds) => {
    if (playerRef?.current) {
      playerRef.current.seek(timeInSeconds);
      // Scroll to video player
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: MdSummarize },
    { id: 'keyPoints', label: 'Key Points', icon: MdLightbulb },
    { id: 'timestamps', label: 'Timestamps', icon: MdAccessTime },
    { id: 'studyNotes', label: 'Study Notes', icon: MdMenuBook },
  ];

  return (
    <div className="mt-6 rounded-lg border border-richblack-700 bg-richblack-800">
      {/* Header with AI badge */}
      <div className="flex flex-col gap-4 border-b border-richblack-700 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-semibold text-richblack-5">
          AI-Generated Content Summary
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs font-medium text-white">
            ✨ Powered by AI
          </span>
          {aiSummary.difficulty && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              aiSummary.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
              aiSummary.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {aiSummary.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Tabs - 2x2 Grid Layout on Mobile, 1 Row on Desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-richblack-700 px-6 pt-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 rounded-t-lg px-4 py-2 font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-richblack-700 text-yellow-50'
                  : 'text-richblack-300 hover:bg-richblack-700/50 hover:text-richblack-100'
              }`}
            >
              <Icon className="text-lg" />
              <span className="text-sm sm:text-base">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <p className="text-richblack-100 leading-relaxed whitespace-pre-line">
              {aiSummary.summary}
            </p>
            {aiSummary.estimatedReadTime && (
              <p className="text-sm text-richblack-400">
                📖 Estimated read time: {aiSummary.estimatedReadTime}
              </p>
            )}
          </div>
        )}

        {/* Key Points Tab */}
        {activeTab === 'keyPoints' && (
          <div className="space-y-3">
            {aiSummary.keyPoints && aiSummary.keyPoints.length > 0 ? (
              <ul className="space-y-3">
                {aiSummary.keyPoints.map((point, index) => (
                  <li
                    key={index}
                    className="flex gap-3 rounded-lg bg-richblack-700 p-4"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500 text-sm font-bold text-richblack-900">
                      {index + 1}
                    </span>
                    <p className="text-richblack-100">{point}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-richblack-400">No key points available</p>
            )}
          </div>
        )}

        {/* Timestamps Tab */}
        {activeTab === 'timestamps' && (
          <div className="space-y-2">
            {aiSummary.timestamps && aiSummary.timestamps.length > 0 ? (
              aiSummary.timestamps.map((timestamp, index) => (
                <button
                  key={index}
                  onClick={() => handleTimestampClick(timestamp.timeInSeconds)}
                  className="w-full rounded-lg border border-richblack-600 bg-richblack-700 p-4 text-left transition-all hover:border-yellow-500 hover:bg-richblack-600"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 rounded bg-yellow-500 px-2 py-1 text-sm font-mono font-bold text-richblack-900">
                      {timestamp.time}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-richblack-5">
                        {timestamp.topic}
                      </h4>
                      <p className="mt-1 text-sm text-richblack-300">
                        {timestamp.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-richblack-400">No timestamps available</p>
            )}
          </div>
        )}

        {/* Study Notes Tab */}
        {activeTab === 'studyNotes' && (
          <div className="prose prose-invert max-w-none">
            {aiSummary.studyNotes ? (
              <ReactMarkdown className="text-richblack-100 markdown-content">
                {aiSummary.studyNotes}
              </ReactMarkdown>
            ) : (
              <p className="text-richblack-400">No study notes available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoSummary;
