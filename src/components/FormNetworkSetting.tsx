import React, { useState, ChangeEvent } from "react";
import {
  Container,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Paper,
  MenuItem,
  FormControl,
  Select,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Grid,
  Button,
  SelectChangeEvent,
} from "@mui/material";
import * as YAML from "yaml";

/**
 * Interface to manage the checked state of network types.
 */
interface NetworkChecked {
  ethernet: boolean;
  wifi: boolean;
  cellular: boolean;
}

/**
 * Interface to manage IP selection mode (auto or manual) for network types.
 */
interface IPSelected {
  ethernet: string;
  wifi: string;
}

/**
 * Interface to manage priority values for network types.
 */
interface Priority {
  ethernet: number | "";
  wifi: number | "";
  cellular: number | "";
}

/**
 * Interface to manage IP addresses for network types.
 */
interface IPAddress {
  ethernet: string;
  wifi: string;
}

/**
 * FormNetworkSetting component for managing network settings.
 *
 * Provides options to configure Ethernet, WiFi, and Cellular network settings,
 * including priority, IP address selection, and DNS settings.
 */
const FormNetworkSetting: React.FC = () => {
  // State to track which network types are enabled (checked)
  const [networkChecked, setNetworkChecked] = useState<NetworkChecked>({
    ethernet: false,
    wifi: false,
    cellular: false,
  });

  // State to track IP selection mode (auto or manual) for each network type
  const [ipSelected, setIpSelected] = useState<IPSelected>({
    ethernet: "auto",
    wifi: "auto",
  });

  // State to track priority numbers for each network type
  const [priority, setPriority] = useState<Priority>({
    ethernet: "",
    wifi: "",
    cellular: "",
  });

  // State to track manual IP addresses, gateways, and DNS addresses for each network type
  const [ipAddress, setIpAddress] = useState<IPAddress>({
    ethernet: "",
    wifi: "",
  });
  const [ipGateway, setIpGateway] = useState<IPAddress>({
    ethernet: "",
    wifi: "",
  });
  const [dnsAddress, setDNSAddress] = useState<IPAddress>({
    ethernet: "",
    wifi: "",
  });

  // State to track WiFi access point and password
  const [accessPoint, setAccessPoint] = useState("");
  const [passwordAccessPoint, setPasswordAccessPoint] = useState("");

  const [errors, setErrors] = useState({
    ethernetIp: false,
    wifiIp: false,
    ethernetGateway: false,
    wifiGateway: false,
    ethernetDNS: false,
    wifiDNS: false,
  });

  /**
   * Handle changes to DNS address fields.
   * @param e - Change event from the input field.
   */
  const handleChangeDNSAddress = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDNSAddress({ ...dnsAddress, [name]: value });
  };

  /**
   * Handle changes to IP address fields.
   * @param e - Change event from the input field.
   */
  const handleChangeIpAddress = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIpAddress({ ...ipAddress, [name]: value });
  };

  /**
   * Handle changes to IP gateway fields.
   * @param e - Change event from the input field.
   */
  const handleChangeIpGateway = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIpGateway({ ...ipGateway, [name]: value });
  };

  /**
   * Handle priority selection changes and check for duplicate values.
   * @param e - Change event from the select input.
   */
  const handlePriorityChange = (e: SelectChangeEvent<number>) => {
    const { name, value } = e.target;
    const selectedValue = value as number;

    if (
      (name === "ethernet" &&
        (selectedValue === priority.wifi ||
          selectedValue === priority.cellular)) ||
      (name === "wifi" &&
        (selectedValue === priority.ethernet ||
          selectedValue === priority.cellular)) ||
      (name === "cellular" &&
        (selectedValue === priority.ethernet ||
          selectedValue === priority.wifi))
    ) {
      alert("Priority value already selected for another network type.");
      return;
    }

    setPriority({ ...priority, [name as string]: value as number });
  };

  /**
   * Handle changes to network checkbox selections.
   * @param e - Change event from the checkbox input.
   */
  const handleCheckChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNetworkChecked({ ...networkChecked, [name]: checked });
  };

  /**
   * Handle changes to IP mode selection (auto or manual).
   * @param e - Change event from the radio group.
   */
  const handleSelectChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIpSelected({ ...ipSelected, [name]: value });
  };

  /**
   * Save the network configuration as a YAML file.
   * @param filejson - JSON object to convert to YAML.
   */
  const saveYAML = (filejson: unknown) => {
    const YAMLfile = YAML.stringify(filejson);

    const blob = new Blob([YAMLfile], { type: "text/yaml" });

    const anchor = document.createElement("a");
    anchor.download = "50-cloud-init.yaml";
    anchor.href = window.URL.createObjectURL(blob);
    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);
  };

  const validateIP = (ip: string, isCIDR: boolean = false) => {
    const CHECK_FORMAT =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const CHECK_FORMAT_PORT =
      /^(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:3[0-2]|[12]?[0-9])$/;
    return isCIDR ? CHECK_FORMAT_PORT.test(ip) : CHECK_FORMAT.test(ip);
  };

  /**
   * Handle form submission and generate YAML configuration.
   * @param e - Form event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fileJSON: any = {
      network: {
        version: 2,
      },
    };

    const ethernetCheck = networkChecked.ethernet;
    const wifiCheck = networkChecked.wifi;
    const cellularCheck = networkChecked.cellular;
    const ethernetIpSelect = ipSelected.ethernet;
    const wifiIPSelect = ipSelected.wifi;

    if (ethernetCheck) {
      if (ethernetIpSelect === "auto") {
        fileJSON.network.ethernets = {
          eth0: {
            dhcp4: true,
            "dhcp4-overrides": {
              "route-metric": priority.ethernet,
            },
          },
        };
      } else {
        const isIpAddressValid = validateIP(ipAddress.ethernet, true);
        const isIpGatewayValid = validateIP(ipGateway.ethernet, false);
        const isDnsAddressValid = validateIP(dnsAddress.ethernet, false);

        if (!isIpAddressValid || !isIpGatewayValid || !isDnsAddressValid) {
          setErrors({
            ...errors,
            ethernetIp: !isIpAddressValid,
            ethernetGateway: !isIpGatewayValid,
            ethernetDNS: !isDnsAddressValid,
          });
          return;
        }

        setErrors({
          ...errors,
          ethernetIp: false,
          ethernetGateway: false,
          ethernetDNS: false,
        });

        fileJSON.network.ethernets = {
          eth0: {
            dhcp4: false,
            addresses: `[${ipAddress.ethernet}]`,
            gateway4: ipGateway.ethernet,
            nameservers: {
              addresses: `[${dnsAddress.ethernet}]`,
            },
          },
        };
      }
    }

    if (wifiCheck) {
      if (wifiIPSelect === "auto") {
        fileJSON.network.wifis = {
          renderer: "networkd",
          wlan0: {
            dhcp4: true,
            "access-points": {
              [accessPoint]: {
                password: passwordAccessPoint,
              },
            },
            "dhcp4-overrides": {
              "route-metric": priority.wifi,
            },
            optional: true,
          },
        };
      } else {
        const isIpAddressValid = validateIP(ipAddress.wifi, true);
        const isIpGatewayValid = validateIP(ipGateway.wifi, false);
        const isDnsAddressValid = validateIP(dnsAddress.wifi, false);

        if (!isIpAddressValid || !isIpGatewayValid || !isDnsAddressValid) {
          setErrors({
            ...errors,
            wifiIp: !isIpAddressValid,
            wifiGateway: !isIpGatewayValid,
            wifiDNS: !isDnsAddressValid,
          });
          return;
        }

        setErrors({
          ...errors,
          wifiIp: false,
          wifiGateway: false,
          wifiDNS: false,
        });

        fileJSON.network.wifis = {
          wlan0: {
            "access-points": {
              [accessPoint]: {
                password: passwordAccessPoint,
              },
            },
            dhcp4: false,
            addresses: `[${ipAddress.wifi}]`,
            gateway4: ipGateway.wifi,
            nameservers: {
              addresses: `[${dnsAddress.wifi}]`,
            },
            optional: true,
          },
        };
      }
    }

    if (cellularCheck) {
      fileJSON.network.ethernets = {
        usb0: {
          dhcp4: true,
          "dhcp4-overrides": {
            "route-metric": priority.cellular,
          },
        },
      };
    }
    if (ethernetCheck && cellularCheck) {
      if (ethernetIpSelect === "auto") {
        fileJSON.network.ethernets = {
          usb0: {
            dhcp4: true,
            "dhcp4-overrides": {
              "route-metric": priority.cellular,
            },
          },
          eth0: {
            dhcp4: true,
            "dhcp4-overrides": {
              "route-metric": priority.ethernet,
            },
          },
        };
      } else {
        fileJSON.network.ethernets = {
          usb0: {
            dhcp4: true,
            "dhcp4-overrides": {
              "route-metric": priority.cellular,
            },
          },
          eth0: {
            dhcp4: false,
            addresses: `[${ipAddress.ethernet}]`,
            gateway4: ipGateway.ethernet,
            nameservers: {
              addresses: `[${dnsAddress.ethernet}]`,
            },
          },
        };
      }
    }
    saveYAML(fileJSON);
  };

  return (
    <Container>
      <FormGroup>
        {/* Ethernet Section */}
        <FormControlLabel
          control={
            <Checkbox
              name="ethernet"
              checked={networkChecked.ethernet}
              onChange={handleCheckChange}
            />
          }
          label="ETHERNET"
        />
        {networkChecked.ethernet && (
          <Box>
            <Paper style={{ padding: "20px" }}>
              <FormControl fullWidth>
                <Typography>1. Priority</Typography>
                <Select
                  value={priority.ethernet}
                  name="ethernet"
                  onChange={(e) => handlePriorityChange(e)}
                  error={priority.ethernet == ""}
                >
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                  <MenuItem value={300}>300</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <RadioGroup
                  value={ipSelected.ethernet}
                  name="ethernet"
                  onChange={handleSelectChange}
                >
                  <FormControlLabel
                    value="auto"
                    control={<Radio />}
                    label="Obtain IP automatically"
                  />
                  <FormControlLabel
                    value="manual"
                    control={<Radio />}
                    label="Use the following IP address"
                  />
                </RadioGroup>
              </FormControl>
              {ipSelected.ethernet === "manual" && (
                <FormControl fullWidth>
                  <Typography>IP Address</Typography>
                  <TextField
                    variant="outlined"
                    placeholder="xxx.xxx.xxx.xx/xx"
                    onChange={handleChangeIpAddress}
                    name="ethernet"
                    error={errors.ethernetIp}
                    helperText={
                      errors.ethernetIp ? "Invalid IP address format" : ""
                    }
                  />
                  <Typography>Default Gateway</Typography>
                  <TextField
                    variant="outlined"
                    placeholder="xxx.xxx.xxx.xx"
                    onChange={handleChangeIpGateway}
                    name="ethernet"
                    error={errors.ethernetGateway}
                    helperText={
                      errors.ethernetGateway ? "Invalid IP Gateway format" : ""
                    }
                  />
                  <Typography>2. Obtain DNS server address</Typography>
                  <Typography>Preferred DNS Server</Typography>
                  <TextField
                    variant="outlined"
                    placeholder="x.x.x.x"
                    onChange={handleChangeDNSAddress}
                    name="ethernet"
                    error={errors.ethernetDNS}
                    helperText={
                      errors.ethernetDNS ? "Invalid DNS Server format" : ""
                    }
                  />
                </FormControl>
              )}
            </Paper>
          </Box>
        )}

        {/* WiFi Section */}
        <FormControlLabel
          control={
            <Checkbox
              name="wifi"
              checked={networkChecked.wifi}
              onChange={handleCheckChange}
            />
          }
          label="WIFI"
        />
        {networkChecked.wifi && (
          <Box>
            <Paper style={{ padding: "20px" }}>
              <FormControl fullWidth>
                <Typography>1. Priority</Typography>
                <Select
                  value={priority.wifi}
                  name="wifi"
                  onChange={(e) => handlePriorityChange(e)}
                  error={priority.wifi == ""}
                >
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                  <MenuItem value={300}>300</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <RadioGroup
                  value={ipSelected.wifi}
                  name="wifi"
                  onChange={handleSelectChange}
                >
                  <FormControlLabel
                    value="auto"
                    control={<Radio />}
                    label="Obtain IP automatically"
                  />
                  <FormControlLabel
                    value="manual"
                    control={<Radio />}
                    label="Use the following IP address"
                  />
                </RadioGroup>
              </FormControl>
              <FormControl fullWidth>
                <Typography>Access Point</Typography>
                <TextField
                  variant="outlined"
                  placeholder="Access Point Name"
                  onChange={(e) => setAccessPoint(e.target.value)}
                  error={accessPoint == ""}
                  helperText={
                    errors.wifiGateway ? "Access Point Name Empty" : ""
                  }
                />
                <Typography>Password</Typography>
                <TextField
                  variant="outlined"
                  type="password"
                  onChange={(e) => setPasswordAccessPoint(e.target.value)}
                  error={passwordAccessPoint == ""}
                  helperText={errors.wifiGateway ? "Password Empty" : ""}
                />
                {ipSelected.wifi === "manual" && (
                  <>
                    <Typography>IP Address</Typography>
                    <TextField
                      variant="outlined"
                      placeholder="xxx.xxx.xxx.xx/xx"
                      name="wifi"
                      onChange={handleChangeIpAddress}
                      error={errors.wifiIp}
                      helperText={
                        errors.wifiIp ? "Invalid IP address format" : ""
                      }
                    />
                    <Typography>Default Gateway</Typography>
                    <TextField
                      variant="outlined"
                      placeholder="xxx.xxx.xxx.xx"
                      name="wifi"
                      onChange={handleChangeIpGateway}
                      error={errors.wifiGateway}
                      helperText={
                        errors.wifiGateway
                          ? "Invalid Gateway address format"
                          : ""
                      }
                    />
                    <Typography>Preferred DNS Server</Typography>
                    <TextField
                      variant="outlined"
                      placeholder="x.x.x.x"
                      name="wifi"
                      onChange={handleChangeDNSAddress}
                      error={errors.wifiDNS}
                      helperText={
                        errors.wifiDNS ? "Invalid DNS Server format" : ""
                      }
                    />
                  </>
                )}
              </FormControl>
            </Paper>
          </Box>
        )}

        {/* Cellular Section */}
        <FormControlLabel
          control={
            <Checkbox
              name="cellular"
              checked={networkChecked.cellular}
              onChange={handleCheckChange}
            />
          }
          label="CELLULAR"
        />
        {networkChecked.cellular && (
          <Box>
            <Paper style={{ padding: "20px" }}>
              <FormControl fullWidth>
                <Typography>1. Priority</Typography>
                <Select
                  value={priority.cellular}
                  name="cellular"
                  onChange={(e) => handlePriorityChange(e)}
                  error={priority.cellular == ""}
                >
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                  <MenuItem value={300}>300</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Box>
        )}
      </FormGroup>
      <Grid container justifyContent="flex-end" spacing={2} paddingY={2}>
        <Grid item>
          <Button variant="contained">Cancel</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FormNetworkSetting;
