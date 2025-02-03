#![no_std]

multiversx_sc::imports!();

#[multiversx_sc::contract]
pub trait Contract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[endpoint]
    fn call_call_bt(&self, to: ManagedAddress, egld_value1: BigUint, egld_value2: BigUint) -> BigUint {
        self.self_proxy(to.clone())
            .send_back_egld_value(egld_value1)
            .execute_on_dest_context::<()>();
        self.self_proxy(to.clone())
            .send_back_egld_value(egld_value2)
            .execute_on_dest_context::<()>();
        self.blockchain().get_back_transfers().total_egld_amount
    }

    #[endpoint]
    fn call_bt_call_bt(&self, to: ManagedAddress, egld_value1: BigUint, egld_value2: BigUint) -> MultiValue2<BigUint, BigUint> {
        self.self_proxy(to.clone())
            .send_back_egld_value(egld_value1)
            .execute_on_dest_context::<()>();
        let bt1 = self.blockchain().get_back_transfers().total_egld_amount;
        self.self_proxy(to.clone())
            .send_back_egld_value(egld_value2)
            .execute_on_dest_context::<()>();
        let bt2 = self.blockchain().get_back_transfers().total_egld_amount;
        (bt1, bt2).into()
    }

    #[endpoint]
    fn send_back_egld_value(&self, egld_value: BigUint) {
        self.send().direct_egld(&self.blockchain().get_caller(), &egld_value);
    }

    #[proxy]
    fn self_proxy(&self, to: ManagedAddress) -> self::Proxy<Self::Api>;
}
