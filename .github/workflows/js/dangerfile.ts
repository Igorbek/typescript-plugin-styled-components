import { danger, fail } from 'danger';
// import yarn from 'danger-plugin-yarn'
// import jest from "danger-plugin-jest"

export default async () => {
  // await yarn()

  if (danger.github.pr) {
    console.log('PR exists', danger.github.pr.html_url);
  } else {
    fail('PR does not exist');
  }

  fail('The danger file is not ready yet');
}
