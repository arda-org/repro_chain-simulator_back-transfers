#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[multiversx_sc::contract]
pub trait Contract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    /// SC A
    #[endpoint]
    fn call_call_bt(&self, to: ManagedAddress, egld_value1: BigUint, egld_value2: BigUint) -> BigUint {
        let payments1 = ManagedVec::from_single_item(
            Payment {
                token_identifier: EgldOrEsdtTokenIdentifier::egld(),
                nonce: 0,
                amount: egld_value1,
            }
        );
        self.self_proxy(to.clone())
            .send_back(payments1)
            .execute_on_dest_context::<()>();
        let payments2 = ManagedVec::from_single_item(
            Payment {
                token_identifier: EgldOrEsdtTokenIdentifier::egld(),
                nonce: 0,
                amount: egld_value2,
            }
        );
        self.self_proxy(to.clone())
            .send_back(payments2)
            .execute_on_dest_context::<()>();
        self.blockchain().get_back_transfers().total_egld_amount
    }

    #[endpoint]
    fn call_bt_call_bt(&self, to: ManagedAddress, egld_value1: BigUint, egld_value2: BigUint) -> MultiValue2<BigUint, BigUint> {
        let payments1 = ManagedVec::from_single_item(
            Payment {
                token_identifier: EgldOrEsdtTokenIdentifier::egld(),
                nonce: 0,
                amount: egld_value1,
            }
        );
        self.self_proxy(to.clone())
            .send_back(payments1)
            .execute_on_dest_context::<()>();
        let bt1 = self.blockchain().get_back_transfers().total_egld_amount;
        let payments2 = ManagedVec::from_single_item(
            Payment {
                token_identifier: EgldOrEsdtTokenIdentifier::egld(),
                nonce: 0,
                amount: egld_value2,
            }
        );
        self.self_proxy(to.clone())
            .send_back(payments2)
            .execute_on_dest_context::<()>();
        let bt2 = self.blockchain().get_back_transfers().total_egld_amount;
        (bt1, bt2).into()
    }

    #[endpoint]
    fn call_send_back_async_v1(
        &self,
        address: ManagedAddress,
        payments: ManagedVec<Payment<Self::Api>>,
    ) {
        self.tx()
            .to(address)
            .raw_call("send_back")
            .argument(&payments)
            .async_call_and_exit()
    }

    #[endpoint]
    fn call_send_back_async_v2(
        &self,
        address: ManagedAddress,
        payments: ManagedVec<Payment<Self::Api>>,
        gas: u64,
    ) {
        self.tx()
            .to(address)
            .raw_call("send_back")
            .argument(&payments)
            .with_gas_limit(gas)
            .register_promise()
    }

    /// SC B
    #[endpoint]
    fn send_back(&self, payments: ManagedVec<Payment<Self::Api>>) {
        let caller = self.blockchain().get_caller();
        for payment in payments.into_iter() {
            self.send().direct(
                &caller,
                &payment.token_identifier,
                payment.nonce,
                &payment.amount,
            )
        }
    }

    #[proxy]
    fn self_proxy(&self, to: ManagedAddress) -> self::Proxy<Self::Api>;
}

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, ManagedVecItem)]
struct Payment<M: ManagedTypeApi> {
    token_identifier: EgldOrEsdtTokenIdentifier<M>,
    nonce: u64,
    amount: BigUint<M>,
}
