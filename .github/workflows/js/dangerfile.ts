import { danger, fail } from 'danger';
// import yarn from 'danger-plugin-yarn'
// import jest from "danger-plugin-jest"

export default async () => {
  if (danger.git) {
    const match = danger.git.fileMatch('.github/**/dangerfile.ts');
    if (match.edited) {
      const file = match.getKeyedPaths().edited[0]
      fail('This dangerfile is not ready yet.', file, 0);
    }
    else
      fail('This dangerfile is not ready yet. Location is unknown.');
  } else {
    fail('PR does not exist');
  }

  // await yarn();
}
