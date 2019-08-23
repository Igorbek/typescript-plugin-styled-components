import yarn from "danger-plugin-yarn"
import jest from "danger-plugin-jest"

export default async () => {
  await yarn()
  await jest()
}
