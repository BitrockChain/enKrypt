import { CallbackFunction, MiddlewareFunction } from "@enkryptcom/types";
import { ProviderRPCRequest } from "@/types/provider";
import { WindowPromise } from "@/libs/window-promise";
import AccountState from "../libs/accounts-state";
import { getCustomError } from "@/libs/error";
import SolanaProvider from "..";
let isAccountAccessPending = false;
const pendingPromises: {
  payload: ProviderRPCRequest;
  res: CallbackFunction;
}[] = [];
const method: MiddlewareFunction = function (
  this: SolanaProvider,
  payload: ProviderRPCRequest,
  res,
  next
): void {
  if (payload.method !== "sol_connect") return next();
  else {
    if (isAccountAccessPending) {
      pendingPromises.push({
        payload,
        res,
      });
      return;
    }
    isAccountAccessPending = true;
    const handleRemainingPromises = () => {
      isAccountAccessPending = false;
      if (pendingPromises.length) {
        const promi = pendingPromises.pop();
        if (promi) handleAccountAccess(promi.payload, promi.res);
      }
    };
    const handleAccountAccess = (
      _payload: ProviderRPCRequest,
      _res: CallbackFunction
    ) => {
      if (_payload.options && _payload.options.domain) {
        isAccountAccessPending = true;
        const accountsState = new AccountState();
        accountsState
          .getApprovedAddresses(_payload.options.domain)
          .then((accounts) => {
            if (accounts.length) {
              _res(
                null,
                accounts.map((acc) => {
                  return {
                    address: this.network.displayAddress(acc),
                    pubkey: acc,
                  };
                })
              );
              handleRemainingPromises();
            } else {
              const windowPromise = new WindowPromise();
              windowPromise
                .getResponse(
                  this.getUIPath(this.UIRoutes.solConnectDApp.path),
                  JSON.stringify({
                    ..._payload,
                    params: [this.network.name],
                  })
                )
                .then(({ error, result }) => {
                  if (error) _res(error as any);
                  const accounts = JSON.parse(result || "[]");
                  _res(
                    null,
                    accounts.map((acc: string) => {
                      return {
                        address: this.network.displayAddress(acc),
                        pubkey: acc,
                      };
                    })
                  );
                })
                .finally(handleRemainingPromises);
            }
          });
      } else {
        _res(getCustomError("No domain set!"));
      }
    };
    handleAccountAccess(payload, res);
  }
};
export default method;