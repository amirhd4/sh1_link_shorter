import { AppRouter } from "./Router";
import { AppInitializer } from "./AppInitializer";

function App() {
  return (
    <AppInitializer>
      <AppRouter />
    </AppInitializer>
  );
}

export default App;