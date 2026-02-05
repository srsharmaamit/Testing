%% Diagram ID: test123
gitGraph
   commit id: "Init" tag: "v0.0.1"
   branch develop
   checkout develop
   commit id: "Initial develop commit"

   branch feature/F1
   checkout feature/F1
   commit id: "F1 - Dev Work"
   commit id: "F1 - More Dev Work"
   checkout develop
   merge feature/F1
   commit id: "F1 merged - Promote to Nexus: dev"
   commit id: "Deploy to Dev (blue-green)"

   branch feature/F2
   checkout feature/F2
   commit id: "F2 - Dev Work"
   checkout develop
   merge feature/F2
   commit id: "F2 merged - Promote to Nexus: dev"
   commit id: "Deploy to Dev (blue-green)"

   branch release/CR123
   checkout release/CR123
   commit id: "Release Prep"
   commit id: "Integration Test Passed"
   commit id: "Promote to Nexus: qa"
   commit id: "Deploy to QA"

   branch hotfix/HF1
   checkout hotfix/HF1
   commit id: "Hotfix for Prod"
   checkout main
   merge hotfix/HF1
   checkout develop
   merge hotfix/HF1

   checkout release/CR123
   commit id: "Final QA Fix"
   checkout main
   merge release/CR123 tag: "v1.0.0"
   checkout develop
   merge release/CR123
   checkout main
   commit id: "Promote to Nexus: prod"
   commit id: "Deploy to Prod (blue-green)"

   branch experimental/try-new-lib
   checkout experimental/try-new-lib
   commit id: "R&D work - not for merge"
