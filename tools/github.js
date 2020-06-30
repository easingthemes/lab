const { Octokit } = require('@octokit/rest');
const dotEnv = require('dotenv');

dotEnv.config();

const config = {
  org: process.env.ORG,
  auth: process.env.DEV_TOKEN,
  count: 3,
  limit: 100
};

const octokit = new Octokit({
  auth: config.auth
});

octokit.orgs.listMembers({
    org: config.org,
  })
  .then(({ data }) => {
    const promises = data.map(i => {
      const owner = i.login;
      return octokit
        .paginate('GET /users/:owner/repos', {
          owner,
          per_page: config.limit
        })
        .then((userRepos) => {
          const allStars = userRepos.map(r => r.stargazers_count);
          const totalStars = allStars.reduce((a, b) => a + b, 0);
          const topStars = allStars.sort((a, b) => b - a).slice(0, config.count);

          return {
            owner,
            repos: userRepos.length,
            totalStars,
            topStars
          }
        })
        .catch(e => console.log(e));
    });

    Promise.all(promises).then((list) => {
      list.sort((a, b) => parseFloat(b.totalStars) - parseFloat(a.totalStars));
      console.log(list);
    });
  });
