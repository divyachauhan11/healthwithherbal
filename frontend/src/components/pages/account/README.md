# Account components

Import the account UI from this folder's public entry point
(`index.js` lists every export):

```jsx
import {
  AccountSidebar,
  AccountOverviewTab,
  AccountOrdersTab,
  AccountAddressesTab,
  OrderCard,
  ReturnRequestModal,
  useAccountData,
  useAddressBook,
  useReturnRequest,
} from "@/components/pages/account";
```

- Tabs and sections: `AccountOverviewTab` (`AccountOrdersOverview`,
  `AccountAddressesOverview`), `AccountOrdersTab`, `AccountAddressesTab`.
- Orders: `AccountOrderList` renders `OrderCard`s, which are composed of
  `OrderCardHeader`, `OrderDeliveredNotice`, `OrderCardItem`,
  `OrderCardSummary` and `OrderCardFooter`.
- Dialogs: `AddressFormModal` (the shared `FormModal`), `ReturnRequestModal`,
  `AccountLogoutConfirm`, `DeleteAddressConfirm`.
- Hooks: `useAccountData` (orders, addresses, live status updates),
  `useAddressBook` (address form, save, delete) and `useReturnRequest`
  (return/exchange dialog state and submission). Pure helpers live in
  `account-utils.js`.

These components use the account CSS class names defined in
`src/app/globals.css`. Include the corresponding account styles in the host
application to preserve the current layout and appearance. Components that
render icons use `lucide-react`.

`OrderCard` accepts the host app's status constants through `orderStatuses`,
`returnExchangeStatuses`, and `returnExchangeTypes`, so it does not depend on
this project's constants module.
