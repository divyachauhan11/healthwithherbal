# Account components

Import the account UI from this folder's public entry point:

```jsx
import {
  AccountAddressCard,
  AccountLoadingState,
  AccountNavigationMenu,
  AccountPageHeader,
  AccountSection,
  AccountSidebar,
  AddressCardActions,
  AddressPreviewCard,
  NoSavedAddresses,
  OrderCard,
  UserProfileCard,
} from "@/components/pages/account";
```

These components use the account CSS class names defined in
`src/app/globals.css`. Include the corresponding account styles in the host
application to preserve the current layout and appearance. Components that
render icons use `lucide-react`.

`OrderCard` accepts the host app's status constants through `orderStatuses`,
`returnExchangeStatuses`, and `returnExchangeTypes`, so it does not depend on
this project's constants module.
