import '../App.css';
import '../assets/ConnectTab.css';
import Pane from './Pane';
import ThemedLabel from './ThemedLabel';
import Tile from './Tile';

function MessagePaneContainer() {
  return (
    <div className="messagePaneContainer">
      <Pane style={{minHeight: 201}}>
        <div className="tile_container_common tile_container_full messageTileContainer">
          <Tile omitHeader={true} style={{minHeight: 200}}>
            <div className="messageContainer">
              <ThemedLabel style={{fontSize: 30}}>Please Connect A Border Router</ThemedLabel>
              <ThemedLabel style={{fontSize: 18, fontWeight: '400'}}>
                Please ensure your host is setup correctly. You can change your host location by
                clicking the gear shaped icon in the top right.
              </ThemedLabel>
            </div>
          </Tile>
        </div>
      </Pane>
    </div>
  );
}

export default function ConnectTab() {
  return <MessagePaneContainer />;
}
