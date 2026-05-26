import "./forestSceneLayered.css";

export function ForestSceneLayered() {
  return (
    <div className="forest-layered-scene" aria-hidden="true">
      <div className="forest-sky-glow" />

      <div className="forest-moon" />

      <div className="forest-hill forest-hill-back" />
      <div className="forest-hill forest-hill-front" />

      <div className="forest-tree forest-tree-left" />
      <div className="forest-tree forest-tree-right" />

      <div className="forest-branch-anchor forest-branch-left" />
      <div className="forest-branch-anchor forest-branch-right" />

      <div className="forest-ground" />

      <div className="forest-firefly firefly-one" />
      <div className="forest-firefly firefly-two" />
      <div className="forest-firefly firefly-three" />
    </div>
  );
}
