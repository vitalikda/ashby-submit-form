import formidable from "formidable";
import { createReadStream } from "fs"
import { NextApiRequest, NextApiResponse } from 'next'

import { submitApplicationApi } from '@/utils/ashby'

export const config = {
  api: {
    bodyParser: false,
  },
};

function formidablePromise(
  req: NextApiRequest,
  opts?: Parameters<typeof formidable>[0]
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable(opts);

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      return resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fields, files } = await formidablePromise(req)
    const { jobPostingId, applicationForm } = fields
    const file = files.resumeFile

    console.log(files)

    const formData = new FormData();
    formData.append('jobPostingId', jobPostingId[0]);
    formData.append('applicationForm', applicationForm[0]);
    const stream = createReadStream(file[0].filepath)
    console.log(stream)
    // @ts-expect-error
    formData.append('resumeFile', stream)

    console.log(formData)
    const response = await submitApplicationApi(formData)

    if (!response) {
      return res.status(400).json({ message: 'Bad request' });
    }

    return res.status(200).json({ message: 'Application submitted' });
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}