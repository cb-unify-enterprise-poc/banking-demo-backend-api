// Demo-only: writes a canned JUnit XML report instead of running a real
// test suite, so the Jenkins pipeline has something to publish to
// CloudBees Unify's Test results tab. Swap for a real test runner
// (e.g. `node --test` or jest) writing real JUnit output in a non-demo
// pipeline.
import { mkdirSync, writeFileSync } from "node:fs";

const report = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="backend-api" tests="8" failures="1" skipped="1" time="2.483">
  <testcase classname="auth" name="logs in with valid credentials" time="0.21"/>
  <testcase classname="auth" name="rejects invalid credentials" time="0.18"/>
  <testcase classname="accounts" name="lists accounts for authenticated user" time="0.24"/>
  <testcase classname="accounts" name="returns 404 for another user's account" time="0.19"/>
  <testcase classname="accounts" name="returns transaction history for an account" time="0.22"/>
  <testcase classname="transfer" name="transfers funds between own accounts" time="0.31"/>
  <testcase classname="transfer" name="rejects transfer with insufficient funds" time="0.27">
    <failure message="expected 400 but received 500">AssertionError: expected response status 400, got 500 at transfer.test.js:42</failure>
  </testcase>
  <testcase classname="transfer" name="rejects transfer across currencies" time="0.0">
    <skipped message="pending: multi-currency fixtures not yet seeded"/>
  </testcase>
</testsuite>
`;

mkdirSync("test-reports", { recursive: true });
writeFileSync("test-reports/junit.xml", report);
console.log("Wrote test-reports/junit.xml (simulated results: 6 passed, 1 failed, 1 skipped)");
