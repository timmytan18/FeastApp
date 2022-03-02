import awsmobile from '../aws-exports';

const REGEX = /.*-(\w+)/;
const ENV = awsmobile.aws_user_files_s3_bucket.match(REGEX)[1];
export default ENV;
