import AssistantSpeechIndicator from "./call/AssistantSpeechIndicator";
import Button from "./base/Button";
import VolumeLevel from "./call/VolumeLevel";

const ActiveCallDetail = ({ assistantIsSpeaking, volumeLevel, onEndCallClick, endCallEnabled = true }) => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
          width: "400px",
          height: "200px",
        }}
      >
        <AssistantSpeechIndicator isSpeaking={assistantIsSpeaking} />
        <VolumeLevel volume={volumeLevel} />
      </div>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Button
          label="End Call"
          onClick={onEndCallClick}
          disabled={!endCallEnabled}
        />
        {!endCallEnabled ? (
          <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#f4f4f5' }}>
            Agent-controlled ending is disabled in this profile.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default ActiveCallDetail;
