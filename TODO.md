# TODO: Fix Initial Loader Behavior

## Current Issue
- InitialLoader appears on page reload and shows logo
- It disappears immediately after initial data (categories, homePageData) loads
- But other components (FeaturedProducts, Heropanel) are still loading their own data
- User wants loader to stay until ALL backend data is rendered

## Plan
1. Create a global loading context to track all loading states
2. Modify InitialLoader to use this global state
3. Update components to report their loading status
4. Ensure loader only disappears when everything is loaded

## Steps
- [ ] Create LoadingContext in AppDataContext.jsx
- [ ] Update App.jsx to use global loading state
- [ ] Modify FeaturedProducts to report loading status
- [ ] Modify Heropanel to report loading status
- [ ] Update InitialLoader to use global loading state
- [ ] Test the complete loading flow

## Status: Changes Reverted
All changes have been reverted to the original state as requested by the user.
