declare module "*.json" {
  const value: import("./types").Catalog;
  export default value;
}
