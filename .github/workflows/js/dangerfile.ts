import { danger, fail } from 'danger';
// import yarn from 'danger-plugin-yarn'
// import jest from "danger-plugin-jest"

export default async () => {
  if (danger.github.pr) {
    console.log('PR exists', danger.github.pr.html_url);
    fail('This dangerfile is not ready yet.');
  } else {
    fail('PR does not exist');
  }

  // await yarn();
}
