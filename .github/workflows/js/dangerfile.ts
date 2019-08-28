import { danger, fail } from 'danger';
import yarn from 'danger-plugin-yarn'
// import jest from "danger-plugin-jest"

export default async () => {
  await yarn()

  fail('The danger file is not ready yet');
}
