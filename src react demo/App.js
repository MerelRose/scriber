import React from 'react';
import './App.css'
import Talen from './talen';
import Video from './video';
import Transcript_video from './transcript_video';
import Transcript_change from './transcript_change';
import Video_Post from './video_POST';
import Talen_Post from './talen_POST';
import Transcript_Post from './transcript_POST';
import Transcribe from './transcribe';
import Video_PUT from './video_PUT';
import Talen_PUT from './talen_PUT';
import Transcript_PUT from './transcript_PUT';
import Video_Del from './video_DEL';
import Transcript_DEL from './transcript_DEL';
import Transcript_Vid_DEL from './transcript_Vid_DEL';
import Transcript_Taal_DEL from './transcript_Taal_DEL';
import Talen_DEL from './talen_DEL';
const App = () => {
  return (
    <div className="flex">
      <Talen />
      <Video />
      <Transcript_video />
      <Transcript_change />
      <Video_Post />
      <Talen_Post />
      <Transcript_Post />
      <Transcribe />
      <Video_PUT />
      <Talen_PUT />
      <Transcript_PUT />
      <Video_Del />
      <Transcript_DEL />
      <Transcript_Vid_DEL />
      <Transcript_Taal_DEL />
      <Talen_DEL />
    </div>
  );
};
export default App;